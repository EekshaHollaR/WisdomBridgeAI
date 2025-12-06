from django.db import models
from django.conf import settings

class KnowledgeInterviewSession(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"

    expert = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'EXPERT'},
        related_name='interview_sessions'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    audio_file = models.FileField(upload_to='interviews/audio/', blank=True, null=True)
    raw_transcript = models.TextField(blank=True)
    structured_notes = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

class InterviewQuestion(models.Model):
    session = models.ForeignKey(KnowledgeInterviewSession, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.question_text[:50]

class InterviewAnswer(models.Model):
    session = models.ForeignKey(KnowledgeInterviewSession, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(InterviewQuestion, on_delete=models.SET_NULL, null=True, blank=True, related_name='answers')
    answer_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer to {self.question_id}"

class KnowledgeItem(models.Model):
    session = models.ForeignKey(KnowledgeInterviewSession, on_delete=models.CASCADE, related_name='knowledge_items')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=100, help_text="procedure, principle, etc.")
    tags = models.JSONField(default=list, blank=True)
    importance_level = models.IntegerField(default=1, choices=[(i, i) for i in range(1, 6)])

    def __str__(self):
        return self.title
