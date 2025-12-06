from rest_framework import serializers
from .models import MentorshipSession, ChatMessage
from knowledge.serializers import ScenarioSerializer

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'content', 'created_at']

class MentorshipSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    scenario = ScenarioSerializer(read_only=True)

    class Meta:
        model = MentorshipSession
        fields = ['id', 'learner', 'scenario', 'module', 'status', 'created_at', 'messages']
        read_only_fields = ['learner', 'created_at', 'messages']
