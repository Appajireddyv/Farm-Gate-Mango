from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', views.RegisterView.as_view()),
    path('farmer/send-otp/', views.FarmerSendOTPView.as_view()),
    path('farmer/verify-otp/', views.FarmerVerifyOTPView.as_view()),
    path('login/', views.LoginView.as_view()),
    path('profile/', views.ProfileView.as_view()),
    path('farmers/', views.FarmerListView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
]
