# -*- encoding: utf-8 -*-
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Expression
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
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
    TransactionDetailSerializer, \
    AccountListSerializer

class BaseAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def validate_request_properties(self, data):
        return

    def get(self, request):
        return make_get_list_serializer(self.Model, self.GetSerializer)

    def post(self, request):
        data = request.data
        self.validate_request_properties(data)

        payload = data.get('payload')
        serializer = self.PostSerializer(data=payload)
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
        payload = data.get('payload')
        serializer = Serializer(data=payload)
        serializer.request_data = data
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'POST'])
# @permission_classes([IsAuthenticated])
def account_list(request):
    return make_serializer_list(request, Account, AccountListSerializer, AccountSerializer)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def transaction_type_list(request):
    return make_serializer_list(request, TransactionType, TransactionTypeSerializer)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
        if model.is_deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)

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

    elif request.method == 'PATCH':
        model.is_deleted = not model.is_deleted
        model.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

def make_serializer_detail_with_uuid(request, Model, Serializer, uuid):    
    try:
        model = Model.objects.get(uuid=uuid)
    except Model.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if model.is_deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)

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

    elif request.method == 'PATCH':
        model.is_deleted = not model.is_deleted
        model.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def account_detail(request, uuid):
    return make_serializer_detail_with_uuid(request, Account, AccountSerializer, uuid)

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def transaction_detail(request, uuid):
    return make_serializer_detail_with_uuid(request, Transaction, TransactionDetailSerializer, uuid)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_account_detail(request, slug):
    return make_serializer_detail_with_slug(request, Account, AccountSerializer, slug)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_detail(request, uuid):
    return make_serializer_detail_with_uuid(request, User, UserSerializer, uuid)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transaction_type_detail(request, slug):
    return make_serializer_detail_with_slug(request, TransactionType, TransactionTypeSerializer, slug)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def transaction_type_detail(request, uuid):
    return make_serializer_detail_with_uuid(request, TransactionType, TransactionTypeSerializer, uuid)

def test(request):
    for a in Account.objects.all():
        a.save()

        for t in a.transactions.all():
            tType = t.transactionType
                if not a.transactions_types.filter(uuid=tType.uuid).exists():
                    a.transactions_types.add(tType)

    return HttpResponse('OK')