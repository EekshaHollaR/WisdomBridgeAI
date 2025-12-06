from django.db import models
from django.conf import settings
from knowledge.models import KnowledgeModule

class MentorshipSession(models.Model):
    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mentorship_sessions")
    module = models.ForeignKey(KnowledgeModule, on_delete=models.SET_NULL, null=True, blank=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    ai_feedback = models.TextField(blank=True)

    def __str__(self):
        return f"Session: {self.learner.username} - {self.start_time.date()}"

class Assessment(models.Model):
    module = models.ForeignKey(KnowledgeModule, on_delete=models.CASCADE, related_name="assessments")
    questions = models.JSONField(help_text="List of questions and options")
    
    def __str__(self):
        return f"Assessment for {self.module.title}"

class AssessmentAttempt(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="attempts")
    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assessment_attempts")
    score = models.FloatField()
    answers = models.JSONField()
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.learner.username} - {self.score}"
