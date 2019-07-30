# -*- encoding: utf-8 -*-
from django.urls import path, include, re_path
from accounting import views
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    path(r'accounts/', views.account_list),
    re_path(r'accounts/(?P<uuid>[-\w]+)/$', views.account_detail),
    re_path(r'account/(?P<slug>[-\w]+)/$', views.get_account_detail),
    path(r'transactions/types/', views.transaction_type_list),
    re_path(r'transactions/type/(?P<slug>[-\w]+)/$', views.get_transaction_type_detail),
    re_path(r'transactions/types/(?P<uuid>[-\w]+)/$', views.transaction_type_detail),
    path(r'transactions/', views.TransactionAPIView.as_view()),
    re_path(r'transactions/(?P<uuid>[-\w]+)/$', views.transaction_detail),
    path(r'profiles/', views.profile_list),
    path(r'profile/', views.CreateUserAPIView.as_view()),
    re_path(r'profile/(?P<uuid>[-\w]+)/$', views.profile_detail),
]

# urlpatterns = format_suffix_patterns(urlpatterns)
