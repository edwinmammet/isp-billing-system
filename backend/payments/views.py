from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random
import string
from .models import Transaction
from .serializers import TransactionSerializer
from .services import MpesaService
from billing.models import Package
from hotspot.models import HotspotUser
from hotspot.services import MikroTikService


def generate_credentials(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-created_at')
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]


@csrf_exempt
@api_view(['POST'])
def initiate_payment(request):
    phone_number = request.data.get('phone_number')
    package_id = request.data.get('package_id')

    if not phone_number or not package_id:
        return Response(
            {'error': 'phone_number and package_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        package = Package.objects.get(id=package_id, is_active=True)
    except Package.DoesNotExist:
        return Response(
            {'error': 'Package not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    transaction = Transaction.objects.create(
        phone_number=phone_number,
        package=package,
        amount=package.price,
        status='PENDING'
    )

    mpesa = MpesaService()
    callback_url = settings.MPESA_CALLBACK_URL
    reference = f'HOTSPOT-{transaction.id}'

    result = mpesa.stk_push_mock(
        phone_number=phone_number,
        amount=package.price,
        callback_url=callback_url,
        reference=reference
    )

    if 'CheckoutRequestID' in result:
        transaction.checkout_request_id = result['CheckoutRequestID']
        transaction.save()
        return Response({
            'message': 'STK push sent. Enter PIN on your phone.',
            'transaction_id': transaction.id,
            'checkout_request_id': result['CheckoutRequestID']
        }, status=status.HTTP_200_OK)
    else:
        transaction.status = 'FAILED'
        transaction.save()
        return Response(
            {'error': 'Failed to initiate payment', 'details': result},
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['POST'])
def mpesa_callback(request):
    data = request.data

    try:
        stk_callback = data['Body']['stkCallback']
        result_code = stk_callback['ResultCode']
        checkout_request_id = stk_callback['CheckoutRequestID']

        transaction = Transaction.objects.get(
            checkout_request_id=checkout_request_id
        )

        if result_code == 0:
            callback_metadata = stk_callback['CallbackMetadata']['Item']
            for item in callback_metadata:
                if item['Name'] == 'MpesaReceiptNumber':
                    transaction.mpesa_reference = item['Value']
                    break

            transaction.status = 'SUCCESS'
            transaction.save()

            # Auto-create HotspotUser
            username = f"hs_{transaction.phone_number}_{transaction.id}"
            password = generate_credentials()
            expires_at = timezone.now() + timedelta(hours=transaction.package.duration_hours)

            HotspotUser.objects.create(
                phone_number=transaction.phone_number,
                package=transaction.package,
                router_username=username,
                router_password=password,
                expires_at=expires_at,
                is_active=True
            )

            mikrotik = MikroTikService()
            mikrotik.create_hotspot_user(
                username=username,
                password=password,
                profile=transaction.package.name,
                uptime_limit=f"{transaction.package.duration_hours}h"
            )

            return Response({'ResultCode': 0, 'ResultDesc': 'Success'})

        else:
            transaction.status = 'FAILED'
            transaction.save()
            return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})

    except Transaction.DoesNotExist:
        return Response({'ResultCode': 0, 'ResultDesc': 'Transaction not found'})
    except Exception as e:
        return Response({'ResultCode': 0, 'ResultDesc': str(e)})