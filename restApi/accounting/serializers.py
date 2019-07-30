# -*- encoding: utf-8 -*-
from rest_framework import serializers
from .models import User, Transaction, TransactionType, Account
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = (
            'uuid',
            'name',
            'color',
            'slug',
        )

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        
        fields = (
            'uuid',
            'name',
            'email',
            'password',
            'role',
            'date_joined',
        )
        read_only_fields = (
            'uuid',
            'date_joined',
        )
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


class AccountTransactionSerializer(serializers.ModelSerializer):
    transactionType = TransactionTypeSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'uuid',
            'transactionType',
            'category',
            'branch',
            'note',
            'consumption',
            'profit',
            'balance',
            'date',
            'order',
        )

updateTransactionsActions = {
    'remove': 'remove',
    'add': 'add',
}
class AccountSerializer(serializers.ModelSerializer):
    transactions = AccountTransactionSerializer(many=True, required=False)

    class Meta:
        model = Account
        fields = (
            'uuid',
            'slug',
            'name',
            'transactions',
            'color',
        )
    
    def create(self, validated_data):
        transactionsIds = self.request_data.get('transactionsIds', [])
        transactions = Transaction.objects.filter(uuid__in=transactionsIds)
        account = Account.objects.create(**validated_data)
        account.transactions.set(transactions)
        return account
    
    def update(self, instance, validated_data):
        requestData = self.request_data
        transactionsIds = requestData.get('transactionsIds', [])
        transactions = Transaction.objects.filter(uuid__in=transactionsIds)
        Account.objects.filter(uuid=instance.uuid).update(**validated_data)
        action = requestData.get('action')
        transactionsIdsLength = len(transactionsIds)
        if transactionsIdsLength > 0 and not updateTransactionsActions[action]:
            raise Exception('action должно быть одиним из значений: remove/add')
        elif transactionsIdsLength > 0:
            makeAction = getattr(instance.transactions, action)
            [makeAction(transaction) for transaction in transactions]
        return instance

class TransactionDetailSerializer(serializers.ModelSerializer):
    transactionType = TransactionTypeSerializer(read_only=True)
    account = AccountSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'uuid',
            'transactionType',
            'category',
            'branch',
            'note',
            'consumption',
            'profit',
            'balance',
            'date',
            'order',
            'account',
        )
        read_only_fields = (
            'uuid',
        )
    
    def create(self, validated_data):
        data = self.request_data

        accountId = data.get('accountId')
        account = Account.objects.get(uuid=accountId)
        if not account:
            raise Exception('Нет аккаунта с uuid: %s' % accountId)
        
        transactionTypeId = data.get('transactionTypeId')
        transactionType = TransactionType.objects.get(uuid=transactionTypeId)
        if not transactionType:
            raise Exception('Нет типа транзакции с uuid: %s' % transactionTypeId)
        
        transaction = Transaction.objects.create(transactionType=transactionType, account=account, **validated_data)
        transaction.order = len(Transaction.objects.filter(date=validated_data.get('date')))

        account.transactions.add(transaction)
        return transaction
    
    def update(self, instance, validated_data):
        transaction = Transaction.objects.filter(uuid=instance.uuid)

        transactionTypeId = self.request_data.get('transactionTypeId')
        if transactionTypeId:
            transactionType = TransactionType.objects.get(uuid=transactionTypeId)
            if not transactionType:
                raise Exception('Нет типа транзакции с uuid: %s' % transactionTypeId)

            transaction.update(transactionType=transactionType)

        transaction.update(**validated_data)
        return instance
