from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from accounts.models import User

def seed_data(request):
    if not User.objects.filter(username='raju_farmer').exists():
        User.objects.create_user(
            username='raju_farmer', password='mango123',
            first_name='Raju', last_name='Patil',
            email='raju@farm.com', role='farmer',
            village='Ratnagiri', district='Ratnagiri',
            state='Maharashtra'
        )
    if not User.objects.filter(username='priya_customer').exists():
        User.objects.create_user(
            username='priya_customer', password='buy123',
            first_name='Priya', last_name='Sharma',
            email='priya@gmail.com', role='customer'
        )
    return JsonResponse({'status': 'Users created!'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('seed/', seed_data),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)