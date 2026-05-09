from django.contrib import admin
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.routers import DefaultRouter
from billing.views import PackageViewSet
from payments.views import TransactionViewSet, initiate_payment, mpesa_callback
from hotspot.views import HotspotUserViewSet
import json

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return JsonResponse({'token': token.key})
        return JsonResponse({'error': 'Invalid credentials'}, status=400)

router = DefaultRouter()
router.register(r'packages', PackageViewSet, basename='package')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'hotspot-users', HotspotUserViewSet, basename='hotspot-user')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', login_view, name='login'),
    path('api/payments/initiate/', initiate_payment, name='initiate-payment'),
    path('api/payments/callback/', mpesa_callback, name='mpesa-callback'),
]