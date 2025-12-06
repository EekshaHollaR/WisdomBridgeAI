from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="expert_profile")
    bio = models.TextField(blank=True)
    expertise_areas = models.TextField(help_text="Comma-separated list of expertise areas")
    years_of_experience = models.IntegerField(default=0)
    
    def __str__(self):
        return f"Expert: {self.user.username}"

class LearnerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="learner_profile")
    learning_goals = models.TextField(blank=True)
    current_role = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"Learner: {self.user.username}"
