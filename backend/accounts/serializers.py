from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ExpertProfile, LearnerProfile

User = get_user_model()

class ExpertProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpertProfile
        fields = ['title', 'department', 'years_experience', 'domains_of_expertise']

class LearnerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearnerProfile
        fields = ['role_title', 'department', 'experience_level', 'learning_goals']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    # Optional profile fields can be accepted here and handled in create
    profile_data = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "role", "profile_data")

    def create(self, validated_data):
        profile_data = validated_data.pop('profile_data', {})
        role = validated_data.get('role', User.Role.LEARNER)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=role
        )
        
        if role == User.Role.EXPERT:
            ExpertProfile.objects.create(user=user, **profile_data)
        elif role == User.Role.LEARNER:
            LearnerProfile.objects.create(user=user, **profile_data)
            
        return user

class UserDetailSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "profile")

    def get_profile(self, obj):
        if obj.role == User.Role.EXPERT:
            return ExpertProfileSerializer(obj.expert_profile).data
        elif obj.role == User.Role.LEARNER:
            return LearnerProfileSerializer(obj.learner_profile).data
        return None
