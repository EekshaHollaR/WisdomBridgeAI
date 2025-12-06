from rest_framework import serializers
from .models import (
    KnowledgeInterviewSession, InterviewQuestion, InterviewAnswer, KnowledgeItem,
    KnowledgeModule, Scenario, DecisionNode, LearningPath
)

class KnowledgeItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeItem
        fields = '__all__'

class InterviewAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewAnswer
        fields = '__all__'

class InterviewQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewQuestion
        fields = '__all__'

class KnowledgeInterviewSessionSerializer(serializers.ModelSerializer):
    questions = InterviewQuestionSerializer(many=True, read_only=True)
    answers = InterviewAnswerSerializer(many=True, read_only=True)
    knowledge_items = KnowledgeItemSerializer(many=True, read_only=True)

    class Meta:
        model = KnowledgeInterviewSession
        fields = [
            'id', 'expert', 'title', 'description', 'status',
            'created_at', 'updated_at', 'audio_file',
            'raw_transcript', 'structured_notes',
            'questions', 'answers', 'knowledge_items'
        ]
        read_only_fields = ['expert', 'created_at', 'updated_at']

# Phase 2 Serializers

class DecisionNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DecisionNode
        fields = '__all__'

class ScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scenario
        fields = '__all__'

class KnowledgeModuleSerializer(serializers.ModelSerializer):
    scenarios = ScenarioSerializer(many=True, read_only=True)
    decision_tree = DecisionNodeSerializer(many=True, read_only=True)

    class Meta:
        model = KnowledgeModule
        fields = '__all__'

class LearningPathSerializer(serializers.ModelSerializer):
    modules = KnowledgeModuleSerializer(many=True, read_only=True)

    class Meta:
        model = LearningPath
        fields = '__all__'
