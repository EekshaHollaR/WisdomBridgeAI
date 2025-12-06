"""
URL configuration for wisdombridge_backend project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/knowledge/", include("knowledge.urls")),
    path("api/mentorship/", include("mentorship.urls")),
    path("api/assessment/", include("assessment.urls")),
    path("api/analytics/", include("analytics.urls")),
]
