# WisdomBridge AI
WisdomBridge AI is an intelligent intergenerational knowledge transfer platform. It extracts expert knowledge through AI-guided interviews, structures it into learning modules, and delivers adaptive mentorship to junior employees to bridge the skills gap.

## Technology Stack
- **Backend**: Django REST Framework (Python), PostgreSQL, SimpleJWT, OpenAI API
- **Frontend**: React (Vite, TypeScript), Tailwind CSS (v3)
- **Infrastructure**: Docker ready (see below)

## Project Structure
- `/backend`: Django project (`wisdombridge_backend`) and applications.
- `/frontend`: React application.
- `/infra`: Infrastructure configurations (Docker, etc.).

## Setup Instructions

### Option 1: Docker (Recommended)
1. **Prerequisites**: Docker & Docker Compose.
2. Navigate to `infra/`.
3. Run: `docker-compose up --build`.
4. Access:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:8000`

### Option 2: Manual Setup

#### Backend
1. **Prerequisites**: Python 3.10+, PostgreSQL.
2. Navigate to `backend/`.
3. Create venv: `python -m venv venv`.
4. Activate: `source venv/bin/activate` or `venv\Scripts\activate`.
5. Install: `pip install -r requirements.txt`.
6. Environment: Configure `.env` (see `infra/.env.backend` for keys).
7. Migrations: `python manage.py migrate`.
8. Run: `python manage.py runserver`.

#### Frontend
1. **Prerequisites**: Node.js 18+.
2. Navigate to `frontend/`.
3. Install: `npm install`.
4. Run: `npm run dev`.

