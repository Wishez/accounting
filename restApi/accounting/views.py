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
    TransactionTypeSerializer, \
    TransactionDetailSerializer

class BaseAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def validate_request_properties():
        return

    def get(self, request):
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
    GetSerializer = TransactionDetailSerializer
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
        data = request.GET.dict()
        email = data.get('email')
        if not email:
            return Response({ "message": "email должен быть валидным полем." }, status=status.HTTP_400_BAD_REQUEST)

        model = self.Model.objects.get(email=email)
        serializer = self.GetSerializer(model)
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
def profile_list(request):
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

def make_serializer_detail_with_slug(request, Model, Serializer, slug):    
    try:
        model = Model.objects.get(slug=slug)
    except Model.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = Serializer(model)
        return Response(serializer.data)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = Serializer(model, data=data, partial=True, many=False)
        serializer.request_data = data
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        model.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

def make_serializer_detail_with_uuid(request, Model, Serializer, uuid):    
    try:
        model = Model.objects.get(uuid=uuid)
    except Model.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = Serializer(model)
        return Response(serializer.data)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = Serializer(model, data=data, partial=True, many=False)
        serializer.request_data = data
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        model.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT', 'DELETE'])
def account_detail(request, uuid):
    return make_serializer_detail_with_uuid(request, Account, AccountSerializer, uuid)

@api_view(['GET', 'PUT', 'DELETE'])
def transaction_detail(request, uuid):
    return make_serializer_detail_with_uuid(request, Transaction, TransactionDetailSerializer, uuid)

@api_view(['GET'])
def get_account_detail(request, slug):
    return make_serializer_detail_with_slug(request, Account, AccountSerializer, slug)

@api_view(['PUT', 'DELETE'])
def profile_detail(request, uuid):
    return make_serializer_detail_with_uuid(request, User, UserSerializer, uuid)

@api_view(['GET'])
def get_transaction_type_detail(request, slug):
    return make_serializer_detail_with_slug(request, TransactionType, TransactionTypeSerializer, slug)

@api_view(['PUT', 'DELETE'])
def transaction_type_detail(request, uuid):
    return make_serializer_detail_with_uuid(request, TransactionType, TransactionTypeSerializer, uuid)