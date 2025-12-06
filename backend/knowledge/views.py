from rest_framework import viewsets, permissions, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import KnowledgeInterviewSession, InterviewQuestion, InterviewAnswer, KnowledgeItem
from .serializers import KnowledgeInterviewSessionSerializer, InterviewAnswerSerializer
from accounts.models import ExpertProfile

# Service Layer
from core.openai_client import (
    generate_expert_interview_questions, 
    analyze_transcript_to_structured_notes, 
    extract_knowledge_items_from_notes
)
from core.transcription import transcribe_audio

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
        
        # Determine questions source: AI or Starter
        use_ai = request.data.get('use_ai', True)
        questions = []
        
        if use_ai and hasattr(request.user, 'expert_profile'):
             questions = generate_expert_interview_questions(request.user.expert_profile, [])
        
        # Fallback if AI fails or disabled
        if not questions:
            questions = [
                "Can you describe a challenging scenario you faced recently?",
                "What core principles guided your decision-making?",
                "What would you advise a junior to do in this situation?"
            ]
            
        # Create questions
        for idx, q_text in enumerate(questions):
            InterviewQuestion.objects.create(session=session, question_text=q_text, order=idx+1)
            
        return Response(self.get_serializer(session).data)

    @action(detail=True, methods=['post'])
    def add_answers(self, request, pk=None):
        session = self.get_object()
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

    @action(detail=True, methods=['post'], parser_classes=[parsers.MultiPartParser, parsers.FormParser])
    def process_audio(self, request, pk=None):
        session = self.get_object()
        
        if 'audio_file' not in request.FILES:
             return Response({"error": "No audio file provided"}, status=status.HTTP_400_BAD_REQUEST)

        audio = request.FILES['audio_file']
        session.audio_file.save(audio.name, audio)
        session.save()

        # 1. Transcribe
        transcript = transcribe_audio(session.audio_file.path)
        session.raw_transcript = transcript
        
        # 2. Analyze
        notes = analyze_transcript_to_structured_notes(transcript)
        session.structured_notes = notes
        
        # 3. Extract Knowledge Items
        items_data = extract_knowledge_items_from_notes(notes)
        created_items = []
        for item in items_data:
            k_item = KnowledgeItem.objects.create(
                session=session,
                title=item.get('title', 'Untitled'),
                description=item.get('description', ''),
                type=item.get('type', 'general'),
                tags=item.get('tags', []),
                importance_level=item.get('importance', 1)
            )
            created_items.append(k_item)
            
        session.save()
        
        return Response({
            "status": "processed",
            "transcript_preview": transcript[:100] + "...",
            "notes_summary": notes.get('summary'),
            "knowledge_items_created": len(created_items)
        })

    @action(detail=True, methods=['post'])
    def generate_questions(self, request, pk=None):
        """Explicitly regenerate questions"""
        session = self.get_object()
        if not hasattr(request.user, 'expert_profile'):
             return Response({"error": "User is not an expert"}, status=status.HTTP_400_BAD_REQUEST)
             
        questions = generate_expert_interview_questions(request.user.expert_profile, [])
        created = []
        current_count = session.questions.count()
        
        for idx, q_text in enumerate(questions):
            q = InterviewQuestion.objects.create(
                session=session, 
                question_text=q_text, 
                order=current_count + idx + 1
            )
            created.append(q.question_text)
            
        return Response({"questions_added": created})
