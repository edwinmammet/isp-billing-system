from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from billing.views import PackageViewSet
from payments.views import TransactionViewSet, initiate_payment, mpesa_callback
from hotspot.views import HotspotUserViewSet

router = DefaultRouter()
router.register(r'packages', PackageViewSet, basename='package')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'hotspot-users', HotspotUserViewSet, basename='hotspot-user')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),
    path('api/payments/initiate/', initiate_payment, name='initiate-payment'),
    path('api/payments/callback/', mpesa_callback, name='mpesa-callback'),
]