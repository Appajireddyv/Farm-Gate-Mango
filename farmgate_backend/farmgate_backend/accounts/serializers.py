import re

from rest_framework import serializers
from .models import User

PHONE_RE = re.compile(r'^\d{10}$')


class FarmerRegistrationDataSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=15)
    village = serializers.CharField(max_length=100, required=False, allow_blank=True)
    district = serializers.CharField(max_length=100, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate_phone(self, value):
        phone = re.sub(r'\D', '', value)[-10:]
        if not PHONE_RE.match(phone):
            raise serializers.ValidationError('Enter a valid 10-digit mobile number.')
        if User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError('This phone number is already registered.')
        return phone

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value


class FarmerVerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(min_length=6, max_length=6)

    def validate_phone(self, value):
        phone = re.sub(r'\D', '', value)[-10:]
        if not PHONE_RE.match(phone):
            raise serializers.ValidationError('Enter a valid 10-digit mobile number.')
        return phone


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone', 'village', 'district', 'state', 'bio']

    def validate(self, attrs):
        if attrs.get('role') == 'farmer':
            raise serializers.ValidationError(
                'Farmer registration requires phone OTP verification.'
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'village', 'district', 'state', 'bio', 'profile_pic', 'is_verified', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_verified']
