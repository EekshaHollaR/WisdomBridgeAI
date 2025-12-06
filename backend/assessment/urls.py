from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssessmentViewSet, AssessmentAttemptViewSet

router = DefaultRouter()
router.register(r'modules', AssessmentViewSet)  # This handles modules/../generate
router.register(r'attempts', AssessmentAttemptViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
