from django.db import models
from django.conf import settings

class KnowledgeInterviewSession(models.Model):
    expert = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="interviews")
    topic = models.CharField(max_length=255)
    date_conducted = models.DateTimeField(auto_now_add=True)
    video_file = models.FileField(upload_to="interviews/videos/", blank=True, null=True)
    audio_file = models.FileField(upload_to="interviews/audio/", blank=True, null=True)
    transcript = models.TextField(blank=True)
    gpt_analysis = models.JSONField(blank=True, null=True, help_text="Structured analysis from OpenAI")
    status = models.CharField(
        max_length=50, 
        choices=[("PENDING", "Pending"), ("PROCESSED", "Processed"), ("FAILED", "Failed")],
        default="PENDING"
    )

    def __str__(self):
        return f"{self.topic} - {self.expert.username}"
