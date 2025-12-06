import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import type { MentorshipSession } from '../../types/mentorship';
import type { KnowledgeModule } from '../../types/knowledge';

const MentorshipHomePage: React.FC = () => {
    const [sessions, setSessions] = useState<MentorshipSession[]>([]);
    const [modules, setModules] = useState<KnowledgeModule[]>([]); // For creating new session
    const [showModal, setShowModal] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
        fetchModules();
    }, []);

    const fetchSessions = () => {
        api.get('/api/mentorship/sessions/')
            .then(res => setSessions(res.data))
            .catch(err => console.error(err));
    };

    const fetchModules = () => {
        api.get('/api/knowledge/modules/')
            .then(res => setModules(res.data))
            .catch(err => console.error(err));
    };

    const handleCreateSession = async () => {
        if (!selectedModuleId) return;

        // Find first scenario for this module to start with (MVP simplification)
        // In a real app, user might pick a specific scenario or the system picks one.
        const selectedModule = modules.find(m => m.id === Number(selectedModuleId));
        if (!selectedModule || !selectedModule.scenarios.length) {
            alert("This module has no scenarios to practice.");
            return;
        }

        try {
            const res = await api.post('/api/mentorship/sessions/start_session/', {
                scenario_id: selectedModule.scenarios[0].id
            });
            setShowModal(false);
            navigate(`/dashboard/mentorship/session/${res.data.id}`);
        } catch (error) {
            console.error(error);
            alert("Failed to start session");
        }
    };

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Mentorship</h1>
                <Button onClick={() => setShowModal(true)}>+ Start New Session</Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map(session => (
                    <Card key={session.id} className="cursor-pointer hover:shadow-lg" onClick={() => navigate(`/dashboard/mentorship/session/${session.id}`)}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                                {session.mode.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                                {new Date(session.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">
                            {session.module?.title || "General Session"}
                        </h3>
                        {session.scenario && (
                            <p className="text-sm text-gray-600 mb-2">Scenario: {session.scenario.title}</p>
                        )}
                        <p className="text-sm text-gray-500">
                            Status: {session.status}
                        </p>
                    </Card>
                ))}
                {sessions.length === 0 && (
                    <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-4">No active mentorship sessions.</p>
                        <Button variant="outline" onClick={() => setShowModal(true)}>Start Your First Session</Button>
                    </div>
                )}
            </div>

            {/* Simple Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Start Mentorship Session</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select a Topic (Module)</label>
                            <select
                                className="w-full border rounded p-2"
                                value={selectedModuleId || ''}
                                onChange={e => setSelectedModuleId(Number(e.target.value))}
                            >
                                <option value="">-- Choose a Module --</option>
                                {modules.map(m => (
                                    <option key={m.id} value={m.id}>{m.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button onClick={handleCreateSession} disabled={!selectedModuleId}>Start AI Mentor</Button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default MentorshipHomePage;
