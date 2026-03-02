from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import SavedCalculator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True, error_messages={
        "blank": "Nazwa nie może być pusta",
        "required": "Błąd przesłania danych [username]",
    })
    email = serializers.EmailField(required=True, error_messages={
        "blank": "Email nie może być pusty",
        "required": "Błąd przesłania danych [email]",
        "invalid": "Email jest błędny",
    })
    password = serializers.CharField(write_only=True, required=True, error_messages={
        "blank": "Hasło nie może być puste",
        "required": "Błąd przesłania danych [password]",
    })
    repeatPassword = serializers.CharField(write_only=True,required=True, error_messages={
        "blank": "Należy powtórzyć hasło",
        "required": "Błąd przesłania danych [repeatPassword]",
    })

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'repeatPassword']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ten email jest już zajęty")
        return value

    def validate(self, data):
        if data['password'] != data['repeatPassword']:
            raise serializers.ValidationError("Hasła nie są takie same")
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('repeatPassword')

        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=password,
            first_name=validated_data['username'],
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate(self, attrs):
        username = (attrs.get("username") or "").strip()
        password = (attrs.get("password") or "").strip()

        if not username:
            raise serializers.ValidationError({
                "username": "Nazwa nie może być pusta"
            })

        if not password:
            raise serializers.ValidationError({
                "password": "Hasło nie może być puste"
            })

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError({
                "username": "Użytkownik nie istnieje"
            })

        user = authenticate(username=user.username, password=password)
        if not user:
            raise serializers.ValidationError({
                "password": "Błędne hasło"
            })

        refresh = RefreshToken.for_user(user)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
        
class SavedCalculatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedCalculator
        fields = ['id', 'name', 'data', 'created_at']

class UsersSerializer(serializers.ModelSerializer):
     test_field = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'first_name', 'username', 'email', 'is_staff', 'is_superuser', 'is_active', 'test_field']
        def get_test_field(self, obj):
        return "TEST"

class SavedCalculatorsSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email')
    class Meta:
        model = SavedCalculator
        fields = ['id', 'user_email', 'name', 'created_at']






























