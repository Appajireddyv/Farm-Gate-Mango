from django.urls import path
from . import views

urlpatterns = [
    path('place/', views.PlaceOrderView.as_view()),
    path('my/', views.CustomerOrdersView.as_view()),
    path('farmer/', views.FarmerOrdersView.as_view()),
    path('<int:pk>/', views.OrderDetailView.as_view()),
]
