# WisdomBridge AI
WisdomBridge AI is an intelligent intergenerational knowledge transfer platform. It extracts expert knowledge through AI-guided interviews, structures it into learning modules, and delivers adaptive mentorship to junior employees to bridge the skills gap.

## Technology Stack
- **Backend**: Django REST Framework (Python), PostgreSQL, SimpleJWT, OpenAI API
- **Frontend**: React (Vite, TypeScript), Tailwind CSS (v3)
- **Infrastructure**: Docker ready (planned)

## Project Structure
- `/backend`: Django project (`wisdombridge_backend`) and applications.
- `/frontend`: React application.
- `/infra`: Infrastructure configurations (Docker, etc.).

## Setup Instructions

### Backend
1. **Prerequisites**: Python 3.10+, PostgreSQL.
2. Navigate to `backend/`.
3. Create venv: `python -m venv venv`.
4. Activate: `source venv/bin/activate` or `venv\Scripts\activate`.
5. Install: `pip install -r requirements.txt`.
6. Environment: Copy `.env.example` to `.env` and configure `DB_*` and `OPENAI_API_KEY`.
7. Migrations: `python manage.py migrate`.
8. Run: `python manage.py runserver`.
   - Health Check: `http://localhost:8000/api/health/`

### Frontend
1. **Prerequisites**: Node.js 18+.
2. Navigate to `frontend/`.
3. Install: `npm install`.
4. Run: `npm run dev`.
   - App: `http://localhost:5173`

## Features
- **Authentication**: JWT-based auth with Role-Based Access Control (Expert, Learner, Admin).
- **Core Apps**: Users, Interviews, Knowledge, Mentorship.
