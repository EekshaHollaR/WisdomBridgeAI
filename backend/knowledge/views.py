from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import KnowledgeInterviewSession, InterviewQuestion, InterviewAnswer
from .serializers import KnowledgeInterviewSessionSerializer, InterviewAnswerSerializer

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        return obj.expert == request.user

class KnowledgeInterviewSessionViewSet(viewsets.ModelViewSet):
    serializer_class = KnowledgeInterviewSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return KnowledgeInterviewSession.objects.all()
        return KnowledgeInterviewSession.objects.filter(expert=user)

    def perform_create(self, serializer):
        serializer.save(expert=self.request.user)

    @action(detail=True, methods=['post'])
    def start_interview(self, request, pk=None):
        session = self.get_object()
        if session.status != KnowledgeInterviewSession.Status.DRAFT:
             return Response({"error": "Session already started"}, status=status.HTTP_400_BAD_REQUEST)
        
        session.status = KnowledgeInterviewSession.Status.IN_PROGRESS
        session.save()
        
        # Add starter questions (mock logic)
        questions = [
            "Can you describe a challenging scenario you faced recently?",
            "What core principles guided your decision-making?",
            "What would you advise a junior to do in this situation?"
        ]
        for idx, q_text in enumerate(questions):
            InterviewQuestion.objects.create(session=session, question_text=q_text, order=idx+1)
            
        return Response(self.get_serializer(session).data)

    @action(detail=True, methods=['post'])
    def add_answers(self, request, pk=None):
        session = self.get_object()
        # Expecting list of {question_id: int, answer_text: str}
        answers_data = request.data.get('answers', [])
        
        created_answers = []
        for ans in answers_data:
            answer = InterviewAnswer.objects.create(
                session=session,
                question_id=ans.get('question_id'),
                answer_text=ans.get('answer_text')
            )
            created_answers.append(answer)
            
        return Response({"status": "answers added", "count": len(created_answers)})

    @action(detail=True, methods=['post'])
    def finalize_interview(self, request, pk=None):
        session = self.get_object()
        session.status = KnowledgeInterviewSession.Status.COMPLETED
        session.save()
        return Response(self.get_serializer(session).data)
