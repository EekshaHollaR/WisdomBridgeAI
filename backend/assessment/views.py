from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Assessment, AssessmentAttempt
from .serializers import AssessmentSerializer, AssessmentAttemptSerializer
from knowledge.models import KnowledgeModule
from core.openai_client import generate_assessment_questions, ask_virtual_expert
from rest_framework.permissions import IsAuthenticated

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='modules/(?P<module_id>[^/.]+)/generate')
    def generate(self, request, module_id=None):
        try:
            module = KnowledgeModule.objects.get(pk=module_id)
        except KnowledgeModule.DoesNotExist:
            return Response({"error": "Module not found"}, status=404)

        # Generate questions using AI
        # Gather content from module description + scenarios
        content_summary = f"{module.description}\n"
        for scenario in module.scenarios.all():
            content_summary += f"Scenario: {scenario.title}. {scenario.situation_prompt}\n"
        
        questions_data = generate_assessment_questions(module.title, content_summary)
        
        if not questions_data:
            return Response({"error": "Failed to generate questions"}, status=500)

        # Create Assessment
        assessment = Assessment.objects.create(
            module=module,
            title=f"Assessment: {module.title}",
            description="AI Generated Assessment based on module content."
        )

        from .models import AssessmentQuestion
        for q in questions_data:
            AssessmentQuestion.objects.create(
                assessment=assessment,
                question_type=q.get('question_type', 'MCQ'),
                prompt=q.get('prompt'),
                options=q.get('options'),
                correct_answer=q.get('correct_answer'),
                weight=q.get('weight', 1.0)
            )
            
        return Response(AssessmentSerializer(assessment).data, status=status.HTTP_201_CREATED)

class AssessmentAttemptViewSet(viewsets.ModelViewSet):
    queryset = AssessmentAttempt.objects.all()
    serializer_class = AssessmentAttemptSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(learner=self.request.user)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        attempt = self.get_object()
        if attempt.completed_at:
            return Response({"error": "Already submitted"}, status=400)
        
        responses = request.data.get('responses', {}) # {question_id: answer}
        
        total_score = 0
        results_detail = {}
        
        # Simple auto-grading for MVP
        for question in attempt.assessment.questions.all():
            learner_answer = responses.get(str(question.id))
            is_correct = False
            
            if question.question_type == 'MCQ':
                # Exact match
                if learner_answer and learner_answer.strip() == question.correct_answer.strip():
                    total_score += question.weight
                    is_correct = True
            else:
                # Open Ended - For now, give full marks if something is written (placeholder logic)
                # Ideally use AI to grade here
                if learner_answer and len(str(learner_answer)) > 10:
                    total_score += question.weight # Optimistic grading
                    is_correct = True
            
            results_detail[question.id] = {
                "correct": is_correct,
                "learner_answer": learner_answer,
                "correct_answer": question.correct_answer
            }

        from django.utils import timezone
        attempt.completed_at = timezone.now()
        attempt.score = total_score
        attempt.results_detail = results_detail
        attempt.save()
        
        return Response(AssessmentAttemptSerializer(attempt).data)
