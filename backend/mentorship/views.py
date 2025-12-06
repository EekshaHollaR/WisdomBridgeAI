from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import MentorshipSession, MentorshipMessage
from .serializers import MentorshipSessionSerializer, MentorshipMessageSerializer
from knowledge.models import Scenario
from accounts.models import LearnerProfile
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
        
        # Build Personalization Context
        context = {}
        try:
            profile = request.user.learner_profile
            context = {
                'learning_style': profile.preferred_learning_style,
                'clarity_level': profile.clarity_level,
                'goals': profile.learning_goals
            }
        except Exception:
            pass # No profile or not a learner
            
        session = MentorshipSession.objects.create(
            learner=request.user,
            scenario=scenario,
            module=scenario.module,
            personalization_context=context,
            mode=MentorshipSession.Mode.AI_AVATAR
        )
        
        # Initial greeting
        greeting = f"Hello! I see you prefer {context.get('learning_style', 'standard')} explanations. Let's tackle '{scenario.title}'.\n\n{scenario.situation_prompt}\n\nWhat's your first move?"
        MentorshipMessage.objects.create(session=session, sender_type=MentorshipMessage.SenderType.AI, content=greeting)
        
        return Response(self.get_serializer(session).data)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        session = self.get_object()
        user_content = request.data.get('content')
        
        if not user_content:
            return Response({"error": "Content required"}, status=status.HTTP_400_BAD_REQUEST)
            
        # 1. Save User Message
        MentorshipMessage.objects.create(session=session, sender_type=MentorshipMessage.SenderType.LEARNER, content=user_content)
        
        # 2. Build Context for AI
        context = {
            'scenario_title': session.scenario.title,
            'situation': session.scenario.situation_prompt,
            'expert_approach': session.scenario.recommended_approach,
            'risks': session.scenario.risks_to_consider,
            'difficulty': session.module.difficulty_level if session.module else 'Intermediate',
            'learning_style': session.personalization_context.get('learning_style', 'VERBAL'),
            'clarity_level': session.personalization_context.get('clarity_level', 'INTERMEDIATE')
        }
        
        # Get history (ChatMessage -> MentorshipMessage)
        # We need to map keys for the client function
        history_msgs = session.messages.order_by('created_at').values('sender_type', 'content')[0:10]
        
        ai_response_text = generate_mentor_response(history_msgs, context)
        
        # 3. Save AI Message
        ai_msg = MentorshipMessage.objects.create(session=session, sender_type=MentorshipMessage.SenderType.AI, content=ai_response_text)
        
        return Response(MentorshipMessageSerializer(ai_msg).data)

from core.openai_client import ask_virtual_expert

class VirtualExpertViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def ask(self, request):
        query = request.data.get('query')
        context_data = request.data.get('context', '')
        
        if not query:
            return Response({"error": "Query required"}, status=status.HTTP_400_BAD_REQUEST)
            
        expert_response = ask_virtual_expert(query, context_data)
        
        return Response({"answer": expert_response})
