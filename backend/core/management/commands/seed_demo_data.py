from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import ExpertProfile, LearnerProfile
from interviews.models import KnowledgeInterviewSession
from knowledge.models import KnowledgeModule, KnowledgeItem, ModuleScenario
from assessment.models import Assessment, AssessmentQuestion

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with demo data (Users, Profiles, Mock Content)'

    def handle(self, *args, **options):
        self.stdout.write("Seeding demo data...")

        # 1. Users
        # Admin
        admin, created = User.objects.get_or_create(username='admin', email='admin@wisdombridge.ai', role='ADMIN')
        if created:
            admin.set_password('admin123')
            admin.is_staff = True
            admin.is_superuser = True
            admin.save()
            self.stdout.write("- Created Admin: admin / admin123")

        # Expert
        expert, created = User.objects.get_or_create(username='expert_jane', email='jane@wisdombridge.ai', role='EXPERT')
        if created:
            expert.set_password('expert123')
            expert.save()
            ExpertProfile.objects.create(
                user=expert,
                title="Senior Systems Architect",
                bio="30 years of experience in legacy banking systems and COBOL migration.",
                expertise_tags="COBOL, Mainframe, Architecture, Migration"
            )
            self.stdout.write("- Created Expert: expert_jane / expert123")

        # Learner 1
        learner1, created = User.objects.get_or_create(username='learner_bob', email='bob@wisdombridge.ai', role='LEARNER')
        if created:
            learner1.set_password('learner123')
            learner1.save()
            LearnerProfile.objects.create(
                user=learner1,
                preferred_learning_style="VISUAL",
                clarity_level="BEGINNER",
                interests="Cloud, Microservices"
            )
            self.stdout.write("- Created Learner: learner_bob / learner123")
        
        # Learner 2
        learner2, created = User.objects.get_or_create(username='learner_alice', email='alice@wisdombridge.ai', role='LEARNER')
        if created:
            learner2.set_password('learner123')
            learner2.save()
            LearnerProfile.objects.create(
                user=learner2,
                preferred_learning_style="HANDS_ON",
                clarity_level="ADVANCED",
                interests="System Design, DevOps"
            )
            self.stdout.write("- Created Learner: learner_alice / learner123")

        # 2. Content
        # Mock Interview
        interview, created = KnowledgeInterviewSession.objects.get_or_create(
            expert=expert,
            title="Legacy Mainframe Migration Setup",
            defaults={
                "status": "COMPLETED",
                "audio_url": "https://example.com/mock_audio.mp3",
                "transcript": "Interviewer: How do we start the migration? Expert: First, we map out the dependencies. The core billing module is critical. It relies on VSAM files..."
            }
        )
        if created:
            self.stdout.write("- Created Interview: Legacy Mainframe Migration Setup")

        # Knowledge Module
        module, created = KnowledgeModule.objects.get_or_create(
            title="Legacy System Migration Fundamentals",
            defaults={
                "source_session": interview,
                "description": "Understanding the core steps to migrate legacy COBOL systems to modern microservices.",
                "status": "PUBLISHED",
                "difficulty_level": "INTERMEDIATE"
            }
        )
        if created:
            self.stdout.write("- Created Module: Legacy System Migration Fundamentals")
            
            # Scenarios
            ModuleScenario.objects.create(
                module=module,
                title="Critical Banking Failure",
                situation_prompt="The nightly batch job failed due to a missing VSAM file.",
                risk_factors="Data inconsistency, Service downtime"
            )

            # Knowledge Items
            KnowledgeItem.objects.create(module=module, content="Map dependencies before touching code.", category="PRINCIPLE", importance=9)
            KnowledgeItem.objects.create(module=module, content="VSAM files must be converted to Relational Tables first.", category="PROCEDURE", importance=8)
            KnowledgeItem.objects.create(module=module, content="Always run parallel runs for 3 months.", category="BEST_PRACTICE", importance=10)
            
            # Assessment
            assessment = Assessment.objects.create(
                module=module,
                title="Migration Basics Quiz",
                description="Test your knowledge on legacy migration steps.",
                max_score=100
            )
            
            AssessmentQuestion.objects.create(
                assessment=assessment,
                question_type="MCQ",
                prompt="What is the first step in migration?",
                options=["Write code", "Map dependencies", "Delete database", "Hire juniors"],
                correct_answer="Map dependencies",
                weight=50.0
            )
            
            AssessmentQuestion.objects.create(
                assessment=assessment,
                question_type="OPEN_ENDED",
                prompt="Why are parallel runs important?",
                correct_answer="To ensure data consistency and verify logic against the old system without risk.",
                weight=50.0
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded demo data!"))
