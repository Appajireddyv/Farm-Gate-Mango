import re

from rest_framework import serializers
from .models import User
from farmgate_backend.serializers_base import StrictModelSerializer, StrictSerializer, strip_string_fields

PHONE_RE = re.compile(r'^\d{10}$')
PASSWORD_MAX_LENGTH = 128


class FarmerRegistrationDataSerializer(StrictSerializer):
    username = serializers.CharField(max_length=150, min_length=3)
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(write_only=True, min_length=8, max_length=PASSWORD_MAX_LENGTH)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=15)
    village = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    district = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    state = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')

    def validate(self, attrs):
        return strip_string_fields(attrs)

    def validate_phone(self, value):
        phone = re.sub(r'\D', '', value)[-10:]
        if not PHONE_RE.match(phone):
            raise serializers.ValidationError('Enter a valid 10-digit mobile number.')
        if User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError('This phone number is already registered.')
        return phone

    def validate_username(self, value):
        value = value.strip()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate_email(self, value):
        return value.strip().lower()


class FarmerVerifyOTPSerializer(StrictSerializer):
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(min_length=6, max_length=6)

    def validate_phone(self, value):
        phone = re.sub(r'\D', '', value)[-10:]
        if not PHONE_RE.match(phone):
            raise serializers.ValidationError('Enter a valid 10-digit mobile number.')
        return phone

    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('OTP must be 6 digits.')
        return value


class RegisterSerializer(StrictModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, max_length=PASSWORD_MAX_LENGTH)
    role = serializers.ChoiceField(choices=['customer'], default='customer', required=False)
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True, default='')
    bio = serializers.CharField(max_length=1000, required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 'last_name',
            'role', 'phone', 'village', 'district', 'state', 'bio',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        attrs = strip_string_fields(attrs)
        if attrs.get('role') == 'farmer':
            raise serializers.ValidationError(
                {'role': ['Farmer registration requires phone OTP verification.']}
            )
        phone = attrs.get('phone', '')
        if phone:
            normalized = re.sub(r'\D', '', phone)[-10:]
            if normalized and not PHONE_RE.match(normalized):
                raise serializers.ValidationError(
                    {'phone': ['Enter a valid 10-digit mobile number.']}
                )
            attrs['phone'] = normalized
        if attrs.get('email'):
            attrs['email'] = attrs['email'].strip().lower()
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class GoogleOAuthSerializer(StrictSerializer):
    credential = serializers.CharField(min_length=100, max_length=10000)


class LoginSerializer(StrictSerializer):
    username = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(max_length=254, required=False, allow_blank=True)
    password = serializers.CharField(
        write_only=True, min_length=1, max_length=PASSWORD_MAX_LENGTH,
    )

    def validate(self, attrs):
        attrs = strip_string_fields(attrs)
        username = attrs.get('username', '')
        email = attrs.get('email', '')
        if not username and not email:
            raise serializers.ValidationError(
                {'non_field_errors': ['Username or email is required.']}
            )
        if username and email:
            raise serializers.ValidationError(
                {'non_field_errors': ['Provide either username or email, not both.']}
            )
        if email:
            attrs['email'] = email.lower()
        return attrs


class UserSerializer(StrictModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone',
            'village', 'district', 'state', 'bio', 'profile_pic', 'is_verified', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'is_verified', 'role', 'username', 'email']

    def validate(self, attrs):
        return strip_string_fields(attrs)
