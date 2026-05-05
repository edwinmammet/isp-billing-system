from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Package
from .serializers import PackageSerializer

class PackageViewSet(viewsets.ModelViewSet):
    queryset = Package.objects.filter(is_active=True)
    serializer_class = PackageSerializer

    def get_permissions(self):
        # Anyone can view packages, only admin can create/edit/delete
        if self.action in ['list', 'retrieve']:
            return []
        return [IsAuthenticated()]
