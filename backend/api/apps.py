from django.apps import AppConfig
from django.contrib.auth import get_user_model
import os

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

class CoreConfin(AppConfig):
    name = "core"

    def ready(self):
        User = get_user_model()

        username = os.enviros.get('ADMIN_USERNAME')
        email = os.enviros.get('ADMIN_EMAIL')
        password = os.enviros.get('ADMIN_PASSWORD')

        if username and password:
            if not User.objects.filter(username=username).exists():
                User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password
                )