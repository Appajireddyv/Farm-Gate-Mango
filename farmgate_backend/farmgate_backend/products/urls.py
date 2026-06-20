from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProductListCreateView.as_view()),
    path('<int:pk>/', views.ProductDetailView.as_view()),
    path('my/', views.FarmerProductsView.as_view()),
    path('<int:pk>/review/', views.ReviewCreateView.as_view()),
]
