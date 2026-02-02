from rest_framework import viewsets
from .models import Resident
from .serializers import ResidentSerializer
from rest_framework.permissions import IsAuthenticated

class ResidentViewSet(viewsets.ModelViewSet):
    queryset = Resident.objects.all()
    serializer_class = ResidentSerializer
    permission_classes = [IsAuthenticated]
