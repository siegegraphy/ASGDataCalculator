from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Replica, Attachment, Ammunition
from .serializers import ReplicaSerializer, AttachmentSerializer, AmmunitionSerializer

class ReplicaViewSet(viewsets.ModelViewSet):
    queryset = Replica.objects.all().order_by('name')
    serializer_class = ReplicaSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all().order_by('name')
    serializer_class = AttachmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

class AmmunitionViewSet(viewsets.ModelViewSet):
    queryset = Ammunition.objects.all().order_by('name')
    serializer_class = AmmunitionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]



