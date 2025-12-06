import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import type { AssessmentAttempt } from '../../types/assessment';

const AssessmentResultPage: React.FC = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (attemptId) fetchResult();
    }, [attemptId]);

    const fetchResult = async () => {
        try {
            const res = await api.get(`/api/assessment/attempts/${attemptId}/`);
            setAttempt(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    if (!attempt) return <MainLayout>Loading Results...</MainLayout>;

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-3xl font-bold mb-6">Assessment Results</h1>

                <Card className="mb-8 p-8 border-t-4 border-indigo-600">
                    <h2 className="text-gray-500 uppercase text-sm tracking-wide mb-2">Total Score</h2>
                    <div className="text-5xl font-extrabold text-indigo-700 mb-4">{attempt.score}</div>
                    <div className="text-gray-600">
                        Completed on {new Date(attempt.completed_at || '').toLocaleDateString()}
                    </div>
                </Card>

                <div className="text-left space-y-4">
                    <h3 className="text-xl font-bold mb-4">Detailed Breakdown</h3>
                    {attempt.results_detail && Object.entries(attempt.results_detail).map(([qId, detail]: [string, any]) => (
                        <Card key={qId} className={`p-4 border-l-4 ${detail.correct ? 'border-green-500' : 'border-red-500'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-gray-800 mb-1">
                                        Question #{qId}
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-semibold text-gray-600">Your Answer: </span>
                                        <span className={detail.correct ? 'text-green-700' : 'text-red-700'}>
                                            {detail.learner_answer || 'No answer'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${detail.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {detail.correct ? 'CORRECT' : 'INCORRECT'}
                                    </span>
                                </div>
                            </div>
                            {!detail.correct && (
                                <div className="mt-2 pt-2 border-t border-gray-100 text-sm">
                                    <span className="font-semibold text-gray-600">Correct Answer: </span>
                                    <span className="text-gray-800">{detail.correct_answer}</span>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>

                <div className="mt-8">
                    <Button onClick={() => navigate('/dashboard/assessments')}>Back to Assessments</Button>
                </div>
            </div>
        </MainLayout>
    );
};

export default AssessmentResultPage;
