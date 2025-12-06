from rest_framework import serializers
from .models import MentorshipSession, MentorshipMessage
from knowledge.serializers import ScenarioSerializer

class MentorshipMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorshipMessage
        fields = ['id', 'sender_type', 'content', 'created_at']

class MentorshipSessionSerializer(serializers.ModelSerializer):
    messages = MentorshipMessageSerializer(many=True, read_only=True)
    scenario = ScenarioSerializer(read_only=True)

    class Meta:
        model = MentorshipSession
        fields = [
            'id', 'learner', 'expert', 'scenario', 'module', 'mode', 
            'status', 'personalization_context', 'created_at', 'messages'
        ]
        read_only_fields = ['learner', 'created_at', 'messages']
