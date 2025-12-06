from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.db.models import Count, Avg, Sum
from django.contrib.auth import get_user_model
from knowledge.models import KnowledgeModule, KnowledgeItem
from mentorship.models import MentorshipSession
from assessment.models import AssessmentAttempt, Assessment

User = get_user_model()

class AnalyticsDashboardView(APIView):
    # For MVP, allow authenticated users to see stats, or restrict to admin
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        # 1. Summary Stats
        total_modules = KnowledgeModule.objects.count()
        total_items = KnowledgeItem.objects.count()
        total_learners = User.objects.filter(learner_profile__isnull=False).count()
        total_sessions = MentorshipSession.objects.count()
        
        # Avg Score
        avg_score = AssessmentAttempt.objects.filter(score__isnull=False).aggregate(Avg('score'))['score__avg'] or 0
        
        # 2. Charts Data
        
        # Sessions per Expert
        sessions_by_expert = MentorshipSession.objects.values('expert__username')\
            .annotate(count=Count('id'))\
            .order_by('-count')[:5]
            
        # Knowledge Gaps (Modules with lowest avg assessment scores)
        low_score_modules = Assessment.objects.values('module__title')\
            .annotate(avg_score=Avg('attempts__score'))\
            .order_by('avg_score')[:5] # Low scores first
            
        # Assessment Score Distribution (Simple buckets for MVP)
        # Doing this in python for simplicity if dataset is small
        attempts = AssessmentAttempt.objects.filter(score__isnull=False).values_list('score', flat=True)
        score_dist = {'0-50': 0, '51-70': 0, '71-85': 0, '86-100': 0}
        for s in attempts:
            if s <= 50: score_dist['0-50'] += 1
            elif s <= 70: score_dist['51-70'] += 1
            elif s <= 85: score_dist['71-85'] += 1
            else: score_dist['86-100'] += 1

        data = {
            "stats": {
                "total_modules": total_modules,
                "total_items": total_items,
                "total_learners": total_learners,
                "total_sessions": total_sessions,
                "avg_assessment_score": round(avg_score, 1)
            },
            "charts": {
                "sessions_by_expert": list(sessions_by_expert),
                "knowledge_gaps": list(low_score_modules),
                "score_distribution": score_dist
            }
        }
        
        return Response(data)
