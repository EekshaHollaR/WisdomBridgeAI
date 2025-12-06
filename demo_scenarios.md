# WisdomBridge AI - Demo Scenarios

These scenarios assume you have run the seeding command:
`python manage.py seed_demo_data`

## Scenario 1: The Expert's Knowledge Capture
**Persona**: Jane (Username: `expert_jane` / Password: `expert123`)

1.  **Login** as `expert_jane`.
2.  **Dashboard**: Notice the "Expert Studio" link.
3.  **Start Interview**:
    *   Navigate to "Expert Studio".
    *   Click "Start New Interview".
    *   Title: "Scaling Cloud Services".
    *   **Action**: Click "Start Recording" (or type in the transcript area if audio is simulated).
    *   **Speak/Type**: "To scale effectively, you must decouple the database from the compute layer..."
    *   Click "Stop" -> "Process Interview".
4.  **Result**: See the system extract "Knowledge Items" and generate a proposed "Module".

## Scenario 2: The Learner's Journey
**Persona**: Bob (Username: `learner_bob` / Password: `learner123`) - *Visual Learner*

1.  **Login** as `learner_bob`.
2.  **Browse Modules**:
    *   Go to "Knowledge Modules".
    *   Select "Legacy System Migration Fundamentals" (Seeded content).
3.  **Mentorship Session**:
    *   Click "Start Mentorship Session".
    *   **Chat**: Ask "How do I start the migration?"
    *   **Observation**: The AI (acting as Jane) should reply using *visual metaphors* (due to Bob's profile), potentially mentioning "blueprints" or "mapping".
4.  **Assessment**:
    *   Go to "Assessments".
    *   Take "Migration Basics Quiz".
    *   Submit answers (Correct: "Map dependencies").
    *   View Results: See 100/100 score.

## Scenario 3: Admin Analytics
**Persona**: Admin (Username: `admin` / Password: `admin123`)

1.  **Login** as `admin`.
2.  **Dashboard**: Navigate to "Analytics".
3.  **Insights**:
    *   See total modules (Legacy Systems + anything new).
    *   See active learners (Bob & Alice).
    *   Check "Knowledge Gaps" chart.
