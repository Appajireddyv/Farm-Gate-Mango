from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, RegistrationOTP
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    FarmerRegistrationDataSerializer,
    FarmerVerifyOTPSerializer,
)
from .otp_utils import generate_otp, send_otp_sms
import logging

logger = logging.getLogger(__name__)

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)

class FarmerSendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = FarmerRegistrationDataSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        otp = generate_otp()

        RegistrationOTP.objects.filter(phone=phone, is_used=False).update(is_used=True)
        RegistrationOTP.objects.create(
            phone=phone,
            otp=otp,
            registration_data=serializer.validated_data,
        )

        extra = send_otp_sms(phone, otp)
        response = {
            'message': 'OTP sent to your mobile number.',
            'phone': phone,
            'expires_in_seconds': 300,
        }
        response.update(extra)
        return Response(response, status=status.HTTP_200_OK)


class FarmerVerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = FarmerVerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        otp = serializer.validated_data['otp']

        otp_record = (
            RegistrationOTP.objects.filter(phone=phone, is_used=False)
            .order_by('-created_at')
            .first()
        )
        if not otp_record or not otp_record.is_valid():
            return Response(
                {'error': 'OTP expired or not found. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if otp_record.otp != otp:
            return Response(
                {'error': 'Invalid OTP. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = otp_record.registration_data
        password = data.pop('password')
        user = User(role='farmer', is_verified=True, **data)
        user.set_password(password)
        user.save()

        otp_record.is_used = True
        otp_record.save(update_fields=['is_used'])

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            body = request.body.decode('utf-8')
        except Exception:
            body = str(request.body)
        logger.info('Login POST received: content_type=%s', request.content_type)
        logger.info('Login request body (truncated): %s', body[:2000])
        logger.info('Login request.data: %s', request.data)

        username_or_email = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        if not username_or_email or not password:
            return Response(
                {'error': 'Username/email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username_or_email, password=password)
        if user is None and '@' in username_or_email:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
            except User.DoesNotExist:
                user_obj = None
            if user_obj:
                user = authenticate(username=user_obj.username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })

        return Response({'error': 'Invalid username/email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class FarmerListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.filter(role='farmer')
