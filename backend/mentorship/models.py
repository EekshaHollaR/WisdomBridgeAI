from django.db import models
from django.conf import settings
from knowledge.models import KnowledgeModule, Scenario

class MentorshipSession(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        COMPLETED = "COMPLETED", "Completed"

    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mentorship_sessions", default=1)
    scenario = models.ForeignKey(Scenario, on_delete=models.SET_NULL, null=True, blank=True)
    module = models.ForeignKey(KnowledgeModule, on_delete=models.SET_NULL, null=True, blank=True) # Optional direct link
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session {self.id} - {self.learner.username}"

class ChatMessage(models.Model):
    class Sender(models.TextChoices):
        AI = "AI", "AI Mentor"
        LEARNER = "LEARNER", "Learner"

    session = models.ForeignKey(MentorshipSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=Sender.choices)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender}: {self.content[:30]}..."
