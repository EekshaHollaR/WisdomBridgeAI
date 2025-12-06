import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import type { Assessment, AssessmentAttempt } from '../../types/assessment';
import type { KnowledgeModule } from '../../types/knowledge';

const AssessmentListPage: React.FC = () => {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [modules, setModules] = useState<KnowledgeModule[]>([]);
    const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
    const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
    const [generating, setGenerating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAssessments();
        fetchModules();
        fetchAttempts();
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

    const fetchAttempts = () => {
        api.get('/api/assessment/attempts/')
            .then(res => setAttempts(res.data))
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
            alert("Failed to generate.");
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

    const continueAttempt = (attemptId: number) => {
        navigate(`/dashboard/assessment/take/${attemptId}`);
    };

    const viewResult = (attemptId: number) => {
        navigate(`/dashboard/assessment/result/${attemptId}`);
    };

    const getLatestAttempt = (assessmentId: number) => {
        // Filter attempts for this assessment and sort by ID desc
        const related = attempts
            .filter(a => a.assessment === assessmentId) // Note: API might return object or ID, ensure types match. usually serialized as ID unless nested.
            // Wait, checks backend serializer: AssessmentAttemptSerializer fields=['assessment', ...] (default PK).
            // But wait, if assessment is an object in attempt? 
            // backend/assessment/serializers.py: AssessmentAttemptSerializer -> fields = [..., 'assessment', ...]. No depth specified, so it's PK.
            .sort((a, b) => b.id - a.id);

        return related.length > 0 ? related[0] : null;
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
                {assessments.map(assessment => {
                    const attempt = getLatestAttempt(assessment.id);
                    const isCompleted = attempt?.completed_at;
                    const isInProgress = attempt && !isCompleted;

                    return (
                        <Card key={assessment.id} className="hover:shadow-md transition-shadow relative">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-xl text-gray-800">{assessment.title}</h3>
                                <div className="flex flex-col items-end">
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-1">
                                        {assessment.max_score} Pts
                                    </span>
                                    {isCompleted && (
                                        <span className={`text-sm font-bold ${attempt.score && attempt.score >= (assessment.max_score * 0.7) ? 'text-green-600' : 'text-orange-600'}`}>
                                            Score: {attempt.score}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-600 mb-6 text-sm">{assessment.description || 'No description'}</p>

                            <div className="flex gap-2">
                                {isCompleted ? (
                                    <>
                                        <Button variant="secondary" onClick={() => viewResult(attempt.id)} className="flex-1">
                                            View Results
                                        </Button>
                                        <Button variant="outline" onClick={() => startAttempt(assessment.id)} className="flex-1">
                                            Retake
                                        </Button>
                                    </>
                                ) : isInProgress ? (
                                    <Button onClick={() => continueAttempt(attempt.id)} className="w-full bg-orange-600 hover:bg-orange-700">
                                        Continue Attempt
                                    </Button>
                                ) : (
                                    <Button onClick={() => startAttempt(assessment.id)} className="w-full">
                                        Start Assessment
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}

                {assessments.length === 0 && (
                    <p className="text-gray-500 col-span-2 text-center py-8">No assessments available. Generate one above!</p>
                )}
            </div>
        </MainLayout>
    );
};

export default AssessmentListPage;
