from django.db import models
from django.conf import settings
from knowledge.models import KnowledgeModule, Scenario

class MentorshipSession(models.Model):
    class Mode(models.TextChoices):
        LIVE = "LIVE", "Live Session"
        ASYNC = "ASYNC", "Async Message"
        AI_AVATAR = "AI_AVATAR", "AI Avatar"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        COMPLETED = "COMPLETED", "Completed"

    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mentorship_sessions_as_learner", default=1)
    expert = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="mentorship_sessions_as_expert")
    scenario = models.ForeignKey(Scenario, on_delete=models.SET_NULL, null=True, blank=True)
    module = models.ForeignKey(KnowledgeModule, on_delete=models.SET_NULL, null=True, blank=True)
    
    mode = models.CharField(max_length=20, choices=Mode.choices, default=Mode.AI_AVATAR)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    session_notes = models.TextField(blank=True)
    personalization_context = models.JSONField(default=dict, blank=True, help_text="Context about learner goals/style")

    def __str__(self):
        return f"Session {self.id} - {self.learner.username}"

class MentorshipMessage(models.Model):
    class SenderType(models.TextChoices):
        AI = "ai", "AI"
        LEARNER = "learner", "Learner"
        EXPERT = "expert", "Expert"

    session = models.ForeignKey(MentorshipSession, on_delete=models.CASCADE, related_name="messages")
    sender_type = models.CharField(max_length=20, choices=SenderType.choices)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender_type}: {self.content[:30]}..."
