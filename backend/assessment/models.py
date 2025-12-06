from django.db import models
from django.conf import settings
from knowledge.models import KnowledgeModule

class Assessment(models.Model):
    module = models.ForeignKey(KnowledgeModule, on_delete=models.CASCADE, related_name='assessments')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True)
    max_score = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.module.title})"

class AssessmentQuestion(models.Model):
    class Type(models.TextChoices):
        MCQ = "MCQ", "Multiple Choice"
        OPEN_ENDED = "OPEN_ENDED", "Open Ended"
        SCENARIO = "SCENARIO", "Scenario Based"

    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=Type.choices, default=Type.MCQ)
    prompt = models.TextField()
    options = models.JSONField(null=True, blank=True, help_text="List of options for MCQ")
    correct_answer = models.TextField(help_text="Correct answer or grading criteria")
    weight = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_question_type_display()}: {self.prompt[:30]}..."

class AssessmentAttempt(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='attempts')
    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assessment_attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    results_detail = models.JSONField(default=dict, blank=True, help_text="Detailed results per question")

    def __str__(self):
        return f"Attempt by {self.learner.username} on {self.assessment.title}"
