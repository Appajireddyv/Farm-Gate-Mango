from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from farmgate_backend.throttling import AuthRateThrottle
from . import views


class ThrottledTokenRefreshView(TokenRefreshView):
    throttle_classes = [AuthRateThrottle]


urlpatterns = [
    path('register/', views.RegisterView.as_view()),
    path('farmer/send-otp/', views.FarmerSendOTPView.as_view()),
    path('farmer/verify-otp/', views.FarmerVerifyOTPView.as_view()),
    path('google/', views.GoogleOAuthView.as_view()),
    path('login/', views.LoginView.as_view()),
    path('profile/', views.ProfileView.as_view()),
    path('farmers/', views.FarmerListView.as_view()),
    path('token/refresh/', ThrottledTokenRefreshView.as_view()),
]
