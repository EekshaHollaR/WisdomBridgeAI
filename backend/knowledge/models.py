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

# --- Phase 2 Models ---

class KnowledgeModule(models.Model):
    session = models.ForeignKey(KnowledgeInterviewSession, on_delete=models.SET_NULL, null=True, related_name='generated_modules')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    objectives = models.JSONField(default=list, blank=True)
    difficulty_level = models.CharField(
        max_length=20, 
        choices=[('BEGINNER', 'Beginner'), ('INTERMEDIATE', 'Intermediate'), ('ADVANCED', 'Advanced')],
        default='BEGINNER'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Scenario(models.Model):
    module = models.ForeignKey(KnowledgeModule, on_delete=models.CASCADE, related_name='scenarios')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    situation_prompt = models.TextField(help_text="The context presented to the learner")
    recommended_approach = models.TextField(help_text="The expert's way")
    risks_to_consider = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.title

class DecisionNode(models.Model):
    module = models.ForeignKey(KnowledgeModule, on_delete=models.CASCADE, related_name='decision_tree')
    prompt = models.TextField()
    # Self-referencing FKs need a string reference usually, or 'self'
    next_if_yes = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='yes_predecessors')
    next_if_no = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='no_predecessors')
    notes = models.TextField(blank=True)
    is_terminal = models.BooleanField(default=False)

    def __str__(self):
        return self.prompt[:50]

class LearningPath(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    target_role = models.CharField(max_length=100)
    modules = models.ManyToManyField(KnowledgeModule, related_name='learning_paths')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name
