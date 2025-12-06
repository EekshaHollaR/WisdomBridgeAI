from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MentorshipSessionViewSet, VirtualExpertViewSet

router = DefaultRouter()
router.register(r'sessions', MentorshipSessionViewSet, basename='mentorship-session')
router.register(r'virtual-expert', VirtualExpertViewSet, basename='virtual-expert')

urlpatterns = [
    path('', include(router.urls)),
]
