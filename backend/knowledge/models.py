from django.db import models

class KnowledgeModule(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Scenario(models.Model):
    module = models.ForeignKey(KnowledgeModule, on_delete=models.CASCADE, related_name="scenarios")
    title = models.CharField(max_length=255)
    situation_description = models.TextField()
    expected_outcome = models.TextField()
    difficulty_level = models.CharField(
        max_length=20, 
        choices=[("BEGINNER", "Beginner"), ("INTERMEDIATE", "Intermediate"), ("ADVANCED", "Advanced")],
        default="BEGINNER"
    )

    def __str__(self):
        return self.title

class KnowledgeItem(models.Model):
    module = models.ForeignKey(KnowledgeModule, on_delete=models.CASCADE, related_name="items")
    title = models.CharField(max_length=255)
    content = models.TextField()
    embedding = models.JSONField(blank=True, null=True, help_text="Vector embedding for search")
    
    def __str__(self):
        return self.title
