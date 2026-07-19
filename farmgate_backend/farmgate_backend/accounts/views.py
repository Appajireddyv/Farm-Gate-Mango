from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from farmgate_backend.throttling import AuthRateThrottle
from .models import User, RegistrationOTP
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    FarmerRegistrationDataSerializer,
    FarmerVerifyOTPSerializer,
    GoogleOAuthSerializer,
    LoginSerializer,
)
from .otp_utils import generate_otp, send_otp_sms
from .oauth_utils import verify_google_token


def _unique_username(base: str) -> str:
    username = base[:150]
    if not User.objects.filter(username=username).exists():
        return username
    counter = 1
    while True:
        candidate = f'{base[:140]}{counter}'
        if not User.objects.filter(username=candidate).exists():
            return candidate
        counter += 1


def _auth_response(user):
    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


class GoogleOAuthView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = GoogleOAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            payload = verify_google_token(serializer.validated_data['credential'])
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        google_id = payload.get('sub')
        email = (payload.get('email') or '').strip().lower()
        if not google_id or not email:
            return Response(
                {'error': 'Google account must include a verified email.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not payload.get('email_verified'):
            return Response(
                {'error': 'Please verify your Google email before signing in.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(google_id=google_id).first()
        if user:
            return _auth_response(user)

        user = User.objects.filter(email__iexact=email).first()
        if user:
            if user.google_id and user.google_id != google_id:
                return Response(
                    {'error': 'This email is linked to a different Google account.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.google_id = google_id
            if not user.first_name and payload.get('given_name'):
                user.first_name = payload['given_name']
            if not user.last_name and payload.get('family_name'):
                user.last_name = payload['family_name']
            user.save()
            return _auth_response(user)

        base_username = email.split('@')[0].replace('.', '_')
        user = User(
            username=_unique_username(base_username),
            email=email,
            google_id=google_id,
            first_name=payload.get('given_name', ''),
            last_name=payload.get('family_name', ''),
            role='customer',
        )
        user.set_unusable_password()
        user.save()
        return _auth_response(user)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

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
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = FarmerRegistrationDataSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        email = serializer.validated_data.get('email', '')
        otp = generate_otp()

        RegistrationOTP.objects.filter(phone=phone, is_used=False).update(is_used=True)
        RegistrationOTP.objects.create(
            phone=phone,
            otp=otp,
            registration_data=serializer.validated_data,
        )

        extra = send_otp_sms(phone, otp, email=email)
        response = {
            'message': 'OTP sent to your mobile number.',
            'phone': phone,
            'expires_in_seconds': 300,
        }
        response.update(extra)
        return Response(response, status=status.HTTP_200_OK)


class FarmerVerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

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

        data = dict(otp_record.registration_data)
        password = data.pop('password')
        data.pop('role', None)  # Remove role if present, as we're setting it explicitly
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
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username_or_email = (
            serializer.validated_data.get('username')
            or serializer.validated_data.get('email')
        )
        password = serializer.validated_data['password']

        user = authenticate(username=username_or_email, password=password)
        if user is None and '@' in username_or_email:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
            except User.DoesNotExist:
                user_obj = None
            if user_obj:
                user = authenticate(username=user_obj.username, password=password)

        if user:
            return _auth_response(user)

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
