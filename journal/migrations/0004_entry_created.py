# Generated by Django 3.2 on 2021-05-29 20:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('journal', '0003_auto_20210529_2005'),
    ]

    operations = [
        migrations.AddField(
            model_name='entry',
            name='created',
            field=models.DateField(default=None, null=True),
        ),
    ]