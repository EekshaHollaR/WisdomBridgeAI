# Django management command to populate demo data
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import ExpertProfile, LearnerProfile
from knowledge.models import KnowledgeInterviewSession, KnowledgeModule, KnowledgeItem
from mentorship.models import MentorshipSession
from assessment.models import Assessment, AssessmentQuestion

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with demo data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating demo data...')

        # Create users if they don't exist
        expert, _ = User.objects.get_or_create(
            username='demo_expert',
            defaults={
                'email': 'expert@demo.com',
                'role': 'EXPERT'
            }
        )
        if _:
            expert.set_password('Demo123!')
            expert.save()
            ExpertProfile.objects.create(
                user=expert,
                title='Senior Software Architect',
                department='Engineering',
                years_experience=15,
                domains_of_expertise=['System Design', 'Cloud Architecture', 'Microservices']
            )
            self.stdout.write(self.style.SUCCESS(f'✓ Created expert user: demo_expert'))

        learner, _ = User.objects.get_or_create(
            username='demo_learner',
            defaults={
                'email': 'learner@demo.com',
                'role': 'LEARNER'
            }
        )
        if _:
            learner.set_password('Demo123!')
            learner.save()
            LearnerProfile.objects.create(
                user=learner,
                role_title='Junior Developer',
                department='Engineering',
                experience_level='Beginner',
                learning_goals=['System Design', 'Best Practices', 'Code Quality']
            )
            self.stdout.write(self.style.SUCCESS(f'✓ Created learner user: demo_learner'))

        # Create Knowledge Module
        module, created = KnowledgeModule.objects.get_or_create(
            title='Introduction to System Design',
            defaults={
                'description': 'Learn the fundamentals of designing scalable software systems',
                'objectives': ['Understand system architecture patterns', 'Learn about scalability', 'Master design trade-offs'],
                'difficulty_level': 'BEGINNER',
                'estimated_duration': 120
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created module: {module.title}'))
            
            # Add knowledge items to the module
            KnowledgeItem.objects.create(
                module=module,
                title='Load Balancing Basics',
                description='Understanding how to distribute traffic across multiple servers',
                type='concept',
                importance_level=5
            )
            KnowledgeItem.objects.create(
                module=module,
                title='Database Sharding',
                description='Techniques for horizontally partitioning databases',
                type='concept',
                importance_level=4
            )

        # Create another module
        module2, created = KnowledgeModule.objects.get_or_create(
            title='Microservices Architecture',
            defaults={
                'description': 'Deep dive into building and managing microservices',
                'objectives': ['Service decomposition', 'Inter-service communication', 'Data management patterns'],
                'difficulty_level': 'INTERMEDIATE',
                'estimated_duration': 180
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created module: {module2.title}'))

        # Create Assessment
        assessment, created = Assessment.objects.get_or_create(
            module=module,
            title='System Design Fundamentals Quiz',
            defaults={
                'description': 'Test your understanding of basic system design concepts',
                'time_limit': 30,
                'passing_score': 70
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created assessment: {assessment.title}'))
            
            # Add questions
            AssessmentQuestion.objects.create(
                assessment=assessment,
                question_text='What is the primary purpose of a load balancer?',
                options=['Store data', 'Distribute traffic', 'Cache responses', 'Authenticate users'],
                correct_answer='Distribute traffic',
                explanation='Load balancers distribute incoming network traffic across multiple servers',
                order=1
            )
            AssessmentQuestion.objects.create(
                assessment=assessment,
                question_text='Which scaling approach adds more machines to your pool of resources?',
                options=['Vertical scaling', 'Horizontal scaling', 'Diagonal scaling', 'Linear scaling'],
                correct_answer='Horizontal scaling',
                explanation='Horizontal scaling means adding more machines, while vertical means adding more power to existing machines',
                order=2
            )

        self.stdout.write(self.style.SUCCESS('\n=== Demo Data Created Successfully! ==='))
        self.stdout.write('\nLogin credentials:')
        self.stdout.write('  Expert: demo_expert / Demo123!')
        self.stdout.write('  Learner: demo_learner / Demo123!')
        self.stdout.write('\nYou can now explore:')
        self.stdout.write('  - 2 Knowledge Modules')
        self.stdout.write('  - 1 Assessment with questions')
        self.stdout.write('  - Expert and Learner profiles\n')
