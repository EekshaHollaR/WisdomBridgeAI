from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        EXPERT = "EXPERT", "Expert"
        LEARNER = "LEARNER", "Learner"

    role = models.CharField(
        max_length=50, choices=Role.choices, default=Role.LEARNER
    )

    def __str__(self):
        return f"{self.username} ({self.role})"

class ExpertProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="expert_profile")
    title = models.CharField(max_length=255, blank=True)
    department = models.CharField(max_length=255, blank=True)
    years_experience = models.IntegerField(default=0)
    domains_of_expertise = models.JSONField(default=list, help_text="List of domains")
    
    def __str__(self):
        return f"Expert: {self.user.username}"

class LearnerProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="learner_profile")
    role_title = models.CharField(max_length=255, blank=True)
    department = models.CharField(max_length=255, blank=True)
    experience_level = models.CharField(max_length=50, blank=True)
    learning_goals = models.JSONField(default=list, help_text="List of goals")
    
    def __str__(self):
        return f"Learner: {self.user.username}"
