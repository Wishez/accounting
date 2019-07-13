# -*- encoding: utf-8 -*-
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import JSONParser
from .models import User, Account, TransactionType, Transaction
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import \
    UserSerializer, \
    AccountSerializer, \
    TransactionSerializer, \
    TransactionTypeSerializer, \
    TransactionDetailSerializer

class BaseAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def validate_request_properties():
        return

    def get(self, request, email):
        return make_get_list_serializer(self.Model, self.GetSerializer)

    def post(self, request):
        data = request.data
        self.validate_request_properties(data)

        serializer = self.PostSerializer(data=data)
        serializer.request_data = data
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class TransactionAPIView(BaseAPIView):
    GetSerializer = TransactionSerializer
    PostSerializer = TransactionDetailSerializer
    Model = Transaction

    def validate_request_properties(self, transaction):
        if not transaction.get('transactionTypeId'):
            return Response('transactionTypeId не может быть пустым!', status=status.HTTP_400_BAD_REQUEST)
        elif not transaction.get('accountId'):
            return Response('accountId не может быть пустым!', status=status.HTTP_400_BAD_REQUEST)

class CreateUserAPIView(BaseAPIView):
    PostSerializer = UserSerializer
    GetSerializer = UserSerializer
    Model = User

    def get(self, request):
        data = JSONParser().parse(request)
        email = data.get('email')
        if not email:
            return Response('email должен быть валидным полем.', status=status.HTTP_400_BAD_REQUEST)

        model = slef.Model.objects.get(email=email)
        serializer = selg.GetSerializer(model)
        return Response(serializer.data)

class AccountAPIView(BaseAPIView):
    GetSerializer = AccountSerializer
    PostSerializer = AccountSerializer
    Model = Account

def make_get_list_serializer(Model, Serializer):
    models = Model.objects.all()
    serializer = Serializer(models, many=True)
    return Response(serializer.data)

def make_serializer_list(request, Model, Serializer, PostSerializer=None):
    if request.method == 'GET':
        return make_get_list_serializer(Model, Serializer)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = Serializer(data=data)
        if serializer.is_valid():
            serializer.request_data = data
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def account_list(request):
    return make_serializer_list(request, Account, AccountSerializer)

@api_view(['GET', 'POST'])
def transaction_type_list(request):
    return make_serializer_list(request, TransactionType, TransactionTypeSerializer)

@api_view(['GET'])
def profile_detail(request):
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users)
        return Response(serializer.data)

def make_serializer_detail(request, Model, Serializer, uuid, PutSerializer=None):
    """
    Retrieve, update or delete a code snippet.
    """
    try:
        model = Model.objects.get(uuid=uuid)
    except Model.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = Serializer(model)
        return Response(serializer.data)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = (PutSerializer or Serializer)(model, data=data, partial=True)
        serializer.request_data = data
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        model.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'PUT', 'DELETE'])
def transaction_detail(request, uuid):
    return make_serializer_detail(request, Transaction, TransactionDetailSerializer, uuid)

@api_view(['GET', 'PUT', 'DELETE'])
def account_detail(request, uuid):
    return make_serializer_detail(request, Account, AccountSerializer, uuid)

@api_view(['PUT', 'DELETE'])
def profile_detail(request, uuid):
    return make_serializer_detail(request, User, UserSerializer, uuid)

@api_view(['PUT', 'DELETE'])
def transaction_type_detail(request, uuid):
    return make_serializer_detail(request, TransactionType, TransactionTypeSerializer, uuid)