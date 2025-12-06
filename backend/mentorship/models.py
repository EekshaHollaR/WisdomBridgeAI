from django.db import models
from django.conf import settings
# from knowledge.models import KnowledgeModule  <-- Removed

# Placeholder for Mentorship models pending refactor
class MentorshipSession(models.Model):
    # learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mentorship_sessions")
    # module = models.ForeignKey(KnowledgeModule, on_delete=models.SET_NULL, null=True, blank=True)
    pass
