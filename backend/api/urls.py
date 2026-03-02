from rest_framework.routers import DefaultRouter
from .views import ReplicaViewSet, AttachmentViewSet, AmmunitionViewSet
from django.urls import path,include

router = DefaultRouter()
router.register('replicas', ReplicaViewSet, basename='replica')
router.register('attachments', AttachmentViewSet, basename='attachment')
router.register('ammunition', AmmunitionViewSet, basename='ammunition')

urlpatterns = [
    path('',include(router.urls)),

]

