from rest_framework import viewsets, permissions, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import (
    KnowledgeInterviewSession, InterviewQuestion, InterviewAnswer, KnowledgeItem,
    KnowledgeModule, Scenario, DecisionNode, LearningPath
)
from .serializers import (
    KnowledgeInterviewSessionSerializer, InterviewAnswerSerializer,
    KnowledgeModuleSerializer, ScenarioSerializer, LearningPathSerializer
)
from accounts.models import ExpertProfile

# Service Layer
from core.openai_client import (
    generate_expert_interview_questions, 
    analyze_transcript_to_structured_notes, 
    extract_knowledge_items_from_notes,
    structure_session_into_modules
)
from core.transcription import transcribe_audio

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        # Handle cases where obj has 'expert' or 'session.expert' or 'module.session.expert'
        # Simplified: Check direct ownership or loose ownership. 
        # For Phase 2 models, we might need stricter checks, but IsAuthenticated is a good baseline.
        if hasattr(obj, 'expert'):
            return obj.expert == request.user
        if hasattr(obj, 'session') and obj.session:
            return obj.session.expert == request.user
        return True # Fallback for now

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
        
        use_ai = request.data.get('use_ai', True)
        questions = []
        
        if use_ai and hasattr(request.user, 'expert_profile'):
             questions = generate_expert_interview_questions(request.user.expert_profile, [])
        
        if not questions:
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

        transcript = transcribe_audio(session.audio_file.path)
        session.raw_transcript = transcript
        
        notes = analyze_transcript_to_structured_notes(transcript)
        session.structured_notes = notes
        
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
    def structure(self, request, pk=None):
        """
        Phase 2: Transform session into KnowledgeModules, Scenarios, and Decision Trees.
        """
        session = self.get_object()
        
        # Gather context
        notes = session.structured_notes
        items = list(session.knowledge_items.values('title', 'description', 'type'))
        
        generated_modules = structure_session_into_modules(notes, items)
        
        created_modules = []
        for mod_data in generated_modules:
            # Create Module
            module = KnowledgeModule.objects.create(
                session=session,
                title=mod_data.get('title', 'Generated Module'),
                description=mod_data.get('description', ''),
                objectives=mod_data.get('objectives', []),
                difficulty_level=mod_data.get('difficulty', 'BEGINNER')
            )
            
            # Create Scenarios
            for scen_data in mod_data.get('scenarios', []):
                Scenario.objects.create(
                    module=module,
                    title=scen_data.get('title', 'Scenario'),
                    situation_prompt=scen_data.get('situation', ''),
                    recommended_approach=scen_data.get('approach', ''),
                    risks_to_consider=scen_data.get('risks', '')
                )
            
            # Create Decision Tree (Simplified flat creation, linking is harder without recursion)
            # For MVP, we just create nodes without linking if IDs are complex, 
            # OR we try to link them. 
            # Here we will just create them flat for now as "nodes".
            node_map = {}
            tree_data = mod_data.get('decision_tree', [])
            
            # First pass: Create all nodes
            for node_data in tree_data:
                node = DecisionNode.objects.create(
                    module=module,
                    prompt=node_data.get('prompt', 'Decision point'),
                    notes=node_data.get('notes', '')
                )
                node_map[node_data.get('id')] = node
            
            # Second pass: Link them (if IDs exist)
            for node_data in tree_data:
                node = node_map.get(node_data.get('id'))
                if node:
                    yes_node = node_map.get(node_data.get('yes_id'))
                    no_node = node_map.get(node_data.get('no_id'))
                    if yes_node:
                        node.next_if_yes = yes_node
                    if no_node:
                        node.next_if_no = no_node
                    node.save()

            created_modules.append(module.title)
            
        return Response({
            "status": "structured",
            "modules_created": created_modules
        })

# Phase 2 ViewSets

class KnowledgeModuleViewSet(viewsets.ModelViewSet):
    serializer_class = KnowledgeModuleSerializer
    permission_classes = [permissions.IsAuthenticated] # Read-only for learners logic to be added
    
    def get_queryset(self):
        return KnowledgeModule.objects.all()

class ScenarioViewSet(viewsets.ModelViewSet):
    serializer_class = ScenarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Scenario.objects.all()

class LearningPathViewSet(viewsets.ModelViewSet):
    serializer_class = LearningPathSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return LearningPath.objects.all()
