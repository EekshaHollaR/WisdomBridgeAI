from rest_framework import serializers
from .models import Assessment, AssessmentQuestion, AssessmentAttempt

class AssessmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentQuestion
        fields = ['id', 'question_type', 'prompt', 'options', 'weight']  # Exclude correct_answer from read

class AssessmentSerializer(serializers.ModelSerializer):
    questions = AssessmentQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Assessment
        fields = ['id', 'module', 'title', 'description', 'instructions', 'max_score', 'questions', 'created_at']

class AssessmentAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentAttempt
        fields = ['id', 'assessment', 'learner', 'started_at', 'completed_at', 'score', 'results_detail']
        read_only_fields = ['learner', 'started_at', 'completed_at', 'score', 'results_detail']
