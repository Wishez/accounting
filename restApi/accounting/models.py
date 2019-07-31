# -*- encoding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, PermissionsMixin, BaseUserManager
)
from model_utils.models import TimeStampedModel
from model_utils import Choices
from django.urls import reverse
import uuid as uuid_lib
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
	"""Define a model manager for User model with no username field."""

	use_in_migrations = True

	def _create_user(self, email, password, **extra_fields):
		"""Create and save a User with the given email and password."""
		if not email:
			raise ValueError('The given email must be set')

		email = self.normalize_email(email)
		user = self.model(email=email, **extra_fields)
		user.set_password(password)
		user.save(using=self._db)
		return user

	def create_user(self, email, password=None, **extra_fields):
		"""Create and save a regular User with the given email and password."""
		extra_fields.setdefault('is_staff', False)
		extra_fields.setdefault('is_superuser', False)
		return self._create_user(email, password, **extra_fields)

	def create_superuser(self, email, password, **extra_fields):
		"""Create and save a SuperUser with the given email and password."""
		extra_fields.setdefault('is_staff', True)
		extra_fields.setdefault('is_superuser', True)
		extra_fields.setdefault('role', 'admin')

		if extra_fields.get('is_staff') is not True:
			raise ValueError('Superuser must have is_staff=True.')
		if extra_fields.get('is_superuser') is not True:
			raise ValueError('Superuser must have is_superuser=True.')

		return self._create_user(email, password, **extra_fields)

roles = (
	('admin', _('Смотрящий')),
	('user', _('Рядовой')),
	('viewer', _('Наблюдающий')),
)
class User(AbstractBaseUser, PermissionsMixin):
	uuid = models.UUIDField(
		_('Идентификатор'),
		db_index=True,
		default=uuid_lib.uuid4,
		editable=True
	)
	email = models.EmailField(_('Email'), max_length=254, unique=True)
	name = models.CharField(_('Имя пользователя'), max_length=254, blank=True)
	role = models.CharField(_('Роль'), max_length=6, choices=roles, default=roles[2][0])
	is_active = models.BooleanField(default=True)
	is_staff = models.BooleanField(default=False)
	date_joined = models.DateTimeField(auto_now_add=True)

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ['name']

	objects = UserManager()

	def save(self, *args, **kwargs):
		super(User, self).save(*args, **kwargs)
		return self

class TransactionType(TimeStampedModel):
    uuid = models.UUIDField(
        _('Идентификатор'),
        db_index=True,
        default=uuid_lib.uuid4,
        editable=True
    )
    name = models.CharField(_('Имя'), max_length=50)
    color = models.CharField(_('Цвет'), max_length=9, blank=True, null=True)
    slug = models.SlugField(
			_('URL'),
			max_length=50,
			unique=True
		)

class Transaction(TimeStampedModel):
	uuid = models.UUIDField(
		_('Идентификатор'),
		db_index=True,
		default=uuid_lib.uuid4,
		editable=True
	)
	# slug = models.SlugField(_('URL'), max_length=50, unique=True)
	transactionType = models.ForeignKey(
		TransactionType,
		verbose_name=_("Транзакции счёта"),
		related_name="transaction_type",
		blank=True,
		on_delete='SET_NULL'
	)
	category = models.CharField(_('Категория'), max_length=50)
	branch = models.CharField(_('Филиал'), max_length=50, blank=True, null=True)
	note = models.CharField(_('Примечание'), max_length=400, blank=True, null=True)
	consumption = models.DecimalField(
		_('Расход'),
		max_digits=12,
		decimal_places=2,
		blank=True,
		default=0.00
	)
	profit = models.DecimalField(
		_('Приход'),
		max_digits=12,
		decimal_places=2,
		blank=True,
		default=0.00
	)
	balance = models.DecimalField(
		_('Баланс/Сальдо'),
		max_digits=12,
		decimal_places=2,
		blank=True,
		default=0.00,
	)
	date = models.DateField(
			_('Дата проведения операции'),
			default=timezone.now
	)
	order = models.IntegerField(
		_('Порядок операции'),
		default=1
	)
	account = models.ForeignKey(
		'accounting.account',
		verbose_name=_("Cчёт транзакции"),
		related_name="account_of_transactions",
		blank=True,
		on_delete="SET_NULL"
	)

class Account(TimeStampedModel):
	uuid = models.UUIDField(
		_('Идентификатор'),
		db_index=True,
		default=uuid_lib.uuid4,
		editable=True
	)
	slug = models.SlugField(_('URL'), max_length=50, unique=True)
	name = models.CharField(_('Имя'), max_length=50)
	transactions = models.ManyToManyField(
		Transaction,
		verbose_name=_("Транзакции счёта"),
		related_name="transactions_of_account",
		blank=True,
	)
	color = models.CharField(_('Цвет'), max_length=9, blank=True, null=True)
