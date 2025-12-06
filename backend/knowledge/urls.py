from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    KnowledgeInterviewSessionViewSet, 
    KnowledgeModuleViewSet, 
    ScenarioViewSet, 
    LearningPathViewSet
)

router = DefaultRouter()
router.register(r'sessions', KnowledgeInterviewSessionViewSet, basename='session')
router.register(r'modules', KnowledgeModuleViewSet, basename='module')
router.register(r'scenarios', ScenarioViewSet, basename='scenario')
router.register(r'paths', LearningPathViewSet, basename='path')

urlpatterns = [
    path('', include(router.urls)),
]
