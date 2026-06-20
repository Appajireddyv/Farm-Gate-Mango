from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Product, ProductReview
from .serializers import ProductSerializer, ProductReviewSerializer

class IsFarmerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'farmer'

class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsFarmerOrReadOnly]

    def get_queryset(self):
        qs = Product.objects.filter(is_available=True)
        category = self.request.query_params.get('category')
        farmer_id = self.request.query_params.get('farmer')
        if category:
            qs = qs.filter(category=category)
        if farmer_id:
            qs = qs.filter(farmer_id=farmer_id)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsFarmerOrReadOnly]
    queryset = Product.objects.all()

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.farmer == request.user

class FarmerProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(farmer=self.request.user).order_by('-created_at')

class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ProductReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        product = Product.objects.get(pk=self.kwargs['pk'])
        serializer.save(customer=self.request.user, product=product)
