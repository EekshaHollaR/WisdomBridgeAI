from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MentorshipSessionViewSet

router = DefaultRouter()
router.register(r'sessions', MentorshipSessionViewSet, basename='mentorship-session')

urlpatterns = [
    path('', include(router.urls)),
]
