from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import HotspotUser
from .serializers import HotspotUserSerializer

class HotspotUserViewSet(viewsets.ModelViewSet):
    queryset = HotspotUser.objects.all().order_by('-created_at')
    serializer_class = HotspotUserSerializer
    permission_classes = [IsAuthenticated]
