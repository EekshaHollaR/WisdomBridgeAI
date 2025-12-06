from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ExpertProfile, LearnerProfile

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "role")

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', User.Role.LEARNER)
        )
        
        # Create profile based on role
        if user.role == User.Role.EXPERT:
            ExpertProfile.objects.create(user=user)
        elif user.role == User.Role.LEARNER:
            LearnerProfile.objects.create(user=user)
            
        return user
