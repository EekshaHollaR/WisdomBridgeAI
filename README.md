# WisdomBridge AI
WisdomBridge AI is an intelligent intergenerational knowledge transfer platform. It extracts expert knowledge through AI-guided interviews, structures it into learning modules, and delivers adaptive mentorship to junior employees to bridge the skills gap.

## Architecture
```
[ Frontend: React + Tailwind + Vite ]  <-- REST API -->  [ Backend: Django REST Framework ]
       |                                                         |
  (User UI)                                              (Business Logic)
                                                                 |
                                                       [ OpenAI GPT-4 API ]
                                                                 |
                                                       [ Postgres Database ]
```

## Key Features & OpenAI Usage
The platform heavily leverages **OpenAI GPT-4** for its core value propositions:
1.  **AI Interviewer**: Generates dynamic follow-up questions during expert interviews.
2.  **Knowledge Extraction**: Turns raw transcripts into structured Learning Modules.
3.  **Virtual Expert**: Answers learner queries using a specific "Senior Expert" persona.
4.  **Assessment Generator**: Creates quizzes based on module content.
*Note: You must configure `OPENAI_API_KEY` in `.env` for these to work.*

## Technology Stack
- **Backend**: Django REST Framework (Python), PostgreSQL, SimpleJWT, OpenAI API
- **Frontend**: React (Vite, TypeScript), Tailwind CSS (v3)
- **Infrastructure**: Docker ready (see below)

## Project Structure
- `/backend`: Django project (`wisdombridge_backend`) and applications.
- `/frontend`: React application.
- `/infra`: Infrastructure configurations (Docker, etc.).

## Setup Instructions

8. Run: `python manage.py runserver`.

#### Frontend
1. **Prerequisites**: Node.js 18+.
2. Navigate to `frontend/`.
3. Install: `npm install`.
4. Run: `npm run dev`.

