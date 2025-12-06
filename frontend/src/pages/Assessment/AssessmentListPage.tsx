import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import type { Assessment } from '../../types/assessment';
import type { KnowledgeModule } from '../../types/knowledge';

const AssessmentListPage: React.FC = () => {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [modules, setModules] = useState<KnowledgeModule[]>([]);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
    const [generating, setGenerating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAssessments();
        fetchModules();
    }, []);

    const fetchAssessments = () => {
        api.get('/api/assessment/modules/')
            .then(res => setAssessments(res.data))
            .catch(err => console.error(err));
    };

    const fetchModules = () => {
        api.get('/api/knowledge/modules/')
            .then(res => setModules(res.data))
            .catch(err => console.error(err));
    };

    const secureGenerate = async () => {
        if (!selectedModuleId) return;
        setGenerating(true);
        try {
            await api.post(`/api/assessment/modules/modules/${selectedModuleId}/generate/`);
            fetchAssessments();
            setSelectedModuleId(null);
        } catch (e) {
            console.error(e);
            alert("Failed to generate. Check console for URL issues.");
        } finally {
            setGenerating(false);
        }
    }

    const startAttempt = async (assessmentId: number) => {
        try {
            const res = await api.post('/api/assessment/attempts/', { assessment: assessmentId });
            navigate(`/dashboard/assessment/take/${res.data.id}`);
        } catch (error) {
            console.error(error);
            alert("Failed to start attempt");
        }
    };

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
            </div>

            <Card className="mb-8 p-6 bg-indigo-50 border-indigo-100">
                <h2 className="text-lg font-bold mb-4">Generate New Assessment</h2>
                <div className="flex gap-4 items-end">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Module</label>
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
                    <Button onClick={secureGenerate} disabled={!selectedModuleId || generating}>
                        {generating ? 'AI Generating...' : 'Generate Assessment'}
                    </Button>
                </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {assessments.map(assessment => (
                    <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-xl text-gray-800">{assessment.title}</h3>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                {assessment.max_score} Pts
                            </span>
                        </div>
                        <p className="text-gray-600 mb-4 text-sm">{assessment.description || 'No description'}</p>
                        <Button onClick={() => startAttempt(assessment.id)} className="w-full">
                            Take Assessment
                        </Button>
                    </Card>
                ))}
                {assessments.length === 0 && (
                    <p className="text-gray-500 col-span-2 text-center py-8">No assessments available. Generate one above!</p>
                )}
            </div>
        </MainLayout>
    );
};

export default AssessmentListPage;
