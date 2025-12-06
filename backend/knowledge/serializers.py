from rest_framework import serializers
from .models import KnowledgeInterviewSession, InterviewQuestion, InterviewAnswer, KnowledgeItem

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
