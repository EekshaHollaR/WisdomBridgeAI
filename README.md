# WisdomBridge AI

WisdomBridge AI is an intelligent intergenerational knowledge transfer platform designed to extract knowledge from retiring experts and deliver adaptive mentorship to junior employees to bridge the skills gap.

## Structure

This is a monorepo containing:

- `/backend`: Django REST Framework API with PostgreSQL.
- `/frontend`: React + TypeScript + Vite application.

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL

## Getting Started

### Backend

1. Navigate to `/backend`.
2. Create a virtual environment: `python -m venv venv`.
3. Activate it: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows).
4. Install dependencies: `pip install -r requirements.txt`.
5. Set up `.env` (see `.env.example`).
6. Run migrations: `python manage.py migrate`.
7. Start server: `python manage.py runserver`.

### Frontend

1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Start dev server: `npm run dev`.
