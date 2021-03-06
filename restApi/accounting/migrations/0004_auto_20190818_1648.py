# Generated by Django 2.2.3 on 2019-08-18 13:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0003_auto_20190731_0913'),
    ]

    operations = [
        migrations.AddField(
            model_name='account',
            name='is_deleted',
            field=models.BooleanField(default=False, verbose_name='Удалён?'),
        ),
        migrations.AddField(
            model_name='transaction',
            name='is_deleted',
            field=models.BooleanField(default=False, verbose_name='Удалён?'),
        ),
        migrations.AddField(
            model_name='transactiontype',
            name='is_deleted',
            field=models.BooleanField(default=False, verbose_name='Удалён?'),
        ),
        migrations.AddField(
            model_name='user',
            name='is_deleted',
            field=models.BooleanField(default=False, verbose_name='Удалён?'),
        ),
    ]
