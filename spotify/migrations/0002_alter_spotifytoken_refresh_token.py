# Generated by Django 4.2.7 on 2023-11-07 16:24

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("spotify", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="spotifytoken",
            name="refresh_token",
            field=models.CharField(max_length=150, null=True),
        ),
    ]
