# -*- encoding: utf-8 -*-
from rest_framework import serializers
from .models import User, Transaction, TransactionType, Account
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
import decimal

class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = (
            'uuid',
            'name',
            'color',
            'slug',
            'is_deleted',
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
            'is_deleted',
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
    
    def create(self, validated_data):
        requestData = self.request_data
        user = User.objects.create(**validated_data)
        user.set_password(validated_data.get('password'))
        user.save()
        return user

    def update(self, instance, validated_data):
        requestData = self.request_data
        oldPassword = instance.password
        password = validated_data.get('password')
        User.objects.filter(uuid=instance.uuid).update(**validated_data)
        user = User.objects.filter(uuid=instance.uuid)[0]
        
        if password and len(password) >= 8:
            user.set_password(password)
        else:
            user.password = oldPassword

        user.save()
        return user


class AccountTransactionSerializer(serializers.ModelSerializer):
    transactionType = TransactionTypeSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'uuid',
            'transactionType',
            'category',
            'segment',
            'transaction_object',
            'note',
            'consumption',
            'profit',
            'balance',
            'date',
            'order',
            'is_deleted',
        )

class AccountListSerializer(serializers.ModelSerializer):
    transactions_types = TransactionTypeSerializer(many=True, required=False)

    class Meta:
        model = Account
        fields = (
            'uuid',
            'slug',
            'name',
            'transactions_types',
            'total_profit',
            'total_balance',
            'total_consumption',
            'color',
            'is_deleted',
        )

updateTransactionsActions = {
    'remove': 'remove',
    'add': 'add',
}

class AccountSerializerPlain(serializers.ModelSerializer):

    class Meta:
        model = Account
        fields = (
            'uuid',
            'slug',
            'name',
            'color',
        )
            
    def create(self, validated_data):
        account = Account.objects.create(**validated_data)

        transactionsIds = self.request_data.get('transactionsIds', [])
        if len(transactionsIds):
            transactions = Transaction.objects.filter(uuid__in=transactionsIds)
            account.transactions.set(transactions)
            
        return account


class AccountSerializer(serializers.ModelSerializer):
    transactions = AccountTransactionSerializer(many=True, required=False)
    transactions_types = TransactionTypeSerializer(many=True, required=False)

    class Meta:
        model = Account
        fields = (
            'uuid',
            'slug',
            'name',
            'transactions',
            'transactions_types',
            'total_profit',
            'total_balance',
            'total_consumption',
            'color',
            'is_deleted',
        )
    
    def update(self, instance, validated_data):
        requestData = self.request_data

        transactionsIds = requestData.get('transactionsIds', [])
        transactions = []
        if len(transactionsIds):
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

def to_fix(number):
    return decimal.Decimal("{0:.2f}".format(number))

def calc_account_transactions(instance):
    accountTransactions = instance.transactions.filter(is_deleted=False).order_by('date')
    accountTransactionsLength = len(accountTransactions)

    if accountTransactionsLength > 0:
        total_profit = decimal.Decimal(0.0)
        total_consumption = decimal.Decimal(0.0)

        for accountTransaction in accountTransactions:
            total_profit = total_profit + decimal.Decimal(accountTransaction.profit)
            total_consumption = total_consumption + decimal.Decimal(accountTransaction.consumption)

        instance.total_balance = to_fix(accountTransactions[accountTransactionsLength - 1].balance)
        instance.total_profit = to_fix(total_profit)
        instance.total_consumption = to_fix(total_consumption)

        instance.save()

class TransactionDetailSerializer(serializers.ModelSerializer):
    transactionType = TransactionTypeSerializer(read_only=True)
    account = AccountSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'uuid',
            'transactionType',
            'category',
            'segment',
            'transaction_object',
            'note',
            'consumption',
            'profit',
            'balance',
            'date',
            'order',
            'account',
            'is_deleted',
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

        trnsactionDate = validated_data.get('date')
        transaction.order = len(Transaction.objects.filter(date=validated_data.get('date')))

        if not account.transactions_types.filter(uuid=transactionType.uuid).exists():
            account.transactions_types.add(transactionType)

        account.transactions.add(transaction)
        calc_account_transactions(account)

        return transaction
    
    def update(self, instance, validated_data):
        transaction = Transaction.objects.filter(uuid=instance.uuid)

        transactionTypeId = self.request_data.get('transactionTypeId')
        transactionType = None
        if transactionTypeId:
            transactionType = TransactionType.objects.get(uuid=transactionTypeId)
            if not transactionType:
                raise Exception('Нет типа транзакции с uuid: %s' % transactionTypeId)

            transaction.update(transactionType=transactionType)

        newBalance = validated_data.get('balance')
        oldBalance = instance.balance
        if newBalance != None and newBalance != oldBalance:
            accountTransactions = Transaction.objects.filter(id__in=instance.account.transactions.all()).order_by('date', 'order')
            nextCreatedTransactions = accountTransactions[[t for t in accountTransactions].index(instance) + 1:]
            lastBalance = newBalance
            for accountTransaction in nextCreatedTransactions:
                accountTransaction.balance = newBalance + accountTransaction.profit - accountTransaction.consumption
                accountTransaction.save()
                lastBalance = accountTransaction.balance

        transaction.update(**validated_data)

        date = validated_data.get('date')
        if date != instance.date:
            order = len(Transaction.objects.filter(date=validated_data.get('date'))) + 1
            transaction.update(order=order)

        calc_account_transactions(instance.account)

        return transaction[0]
