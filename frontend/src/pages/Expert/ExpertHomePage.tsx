import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import type { KnowledgeInterviewSession } from '../../types/knowledge';

const ExpertHomePage: React.FC = () => {
    const [sessions, setSessions] = useState<KnowledgeInterviewSession[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/api/knowledge/sessions/');
            setSessions(response.data);
        } catch (error) {
            console.error("Error fetching sessions", error);
        }
    };

    const handleCreateSession = async () => {
        // Simple prompt for MVP
        const title = prompt("Enter session title:");
        if (!title) return;

        try {
            const createRes = await api.post('/api/knowledge/sessions/', {
                title,
                description: "Created via Expert Dashboard"
            });
            const session = createRes.data;

            // Auto-start (generate questions)
            if (confirm("Generate AI questions now?")) {
                await api.post(`/api/knowledge/sessions/${session.id}/start_interview/`, { use_ai: true });
            }

            navigate(`/dashboard/expert/session/${session.id}`);
        } catch (error) {
            console.error("Error creating session", error);
        }
    };

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Expert Dashboard</h1>
                <Button onClick={handleCreateSession}>Start New Interview</Button>
            </div>

            <div className="grid gap-6">
                {sessions.length === 0 && <p className="text-gray-500">No interview sessions found. Start one above!</p>}
                {sessions.map(session => (
                    <Card key={session.id} className="flex justify-between items-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/dashboard/expert/session/${session.id}`)}>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{session.title}</h3>
                            <p className="text-sm text-gray-500">Created: {new Date(session.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${session.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                session.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {session.status}
                            </span>
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/expert/session/${session.id}`); }}>
                                Continue
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </MainLayout>
    );
};

export default ExpertHomePage;
