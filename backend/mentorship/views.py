from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import MentorshipSession, ChatMessage
from .serializers import MentorshipSessionSerializer, ChatMessageSerializer
from knowledge.models import Scenario
from core.openai_client import generate_mentor_response

class MentorshipSessionViewSet(viewsets.ModelViewSet):
    serializer_class = MentorshipSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MentorshipSession.objects.filter(learner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(learner=self.request.user)

    @action(detail=False, methods=['post'])
    def start_session(self, request):
        scenario_id = request.data.get('scenario_id')
        scenario = get_object_or_404(Scenario, pk=scenario_id)
        
        # Check active session? For now allow multiple
        session = MentorshipSession.objects.create(
            learner=request.user,
            scenario=scenario,
            module=scenario.module
        )
        
        # Initial greeting from AI
        greeting = f"Hello! I'm here to help you work through the '{scenario.title}' scenario. \n\nSituation: {scenario.situation_prompt}\n\nHow would you approach this?"
        ChatMessage.objects.create(session=session, sender=ChatMessage.Sender.AI, content=greeting)
        
        return Response(self.get_serializer(session).data)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        session = self.get_object()
        user_content = request.data.get('content')
        
        if not user_content:
            return Response({"error": "Content required"}, status=status.HTTP_400_BAD_REQUEST)
            
        # 1. Save User Message
        ChatMessage.objects.create(session=session, sender=ChatMessage.Sender.LEARNER, content=user_content)
        
        # 2. Generate AI Response
        # Build context
        context = {
            'scenario_title': session.scenario.title,
            'situation': session.scenario.situation_prompt,
            'expert_approach': session.scenario.recommended_approach,
            'risks': session.scenario.risks_to_consider,
            'difficulty': session.module.difficulty_level
        }
        
        # Get history (last 10 messages for context window)
        history = session.messages.order_by('created_at').values('sender', 'content')[0:10]
        
        ai_response_text = generate_mentor_response(history, context)
        
        # 3. Save AI Message
        ai_msg = ChatMessage.objects.create(session=session, sender=ChatMessage.Sender.AI, content=ai_response_text)
        
        return Response(ChatMessageSerializer(ai_msg).data)
