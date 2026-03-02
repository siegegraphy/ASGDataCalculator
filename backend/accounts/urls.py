from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterViewSet, LoginViewSet, SavedCalculatorViewSet, NameView, UsersViewSet, SavedCalculatorsViewSet
from rest_framework_simplejwt.views import (TokenRefreshView)

router = DefaultRouter()
router.register('calculators', SavedCalculatorViewSet, basename='calculator')
router.register('users', UsersViewSet, basename='users')
router.register('savedCalculators', SavedCalculatorsViewSet, basename='savedCalculators')

urlpatterns = [
    path('register/', RegisterViewSet.as_view(), name='register'),
    path('token/', LoginViewSet.as_view(), name='token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('name/', NameView.as_view(), name='name'),
    path('', include(router.urls)),
]


