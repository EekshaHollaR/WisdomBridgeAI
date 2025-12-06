import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import type { AssessmentAttempt, Assessment } from '../../types/assessment';

const AssessmentTakingPage: React.FC = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (attemptId) {
            fetchAttemptData();
        }
    }, [attemptId]);

    const fetchAttemptData = async () => {
        try {
            const res = await api.get(`/api/assessment/attempts/${attemptId}/`);
            setAttempt(res.data);
            // Fetch assessment details (questions)
            // Ideally attempt should include assessment details or we fetch separately
            // The serializer for attempt usually returns assessment ID
            if (res.data.assessment) {
                const assessRes = await api.get(`/api/assessment/modules/${res.data.assessment}/`); // Note URL quirk from list page
                setAssessment(assessRes.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAnswerChange = (questionId: number, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        if (!window.confirm("Are you sure you want to submit?")) return;
        setSubmitting(true);
        try {
            await api.post(`/api/assessment/attempts/${attemptId}/submit/`, { responses: answers });
            navigate(`/dashboard/assessment/result/${attemptId}`);
        } catch (error) {
            console.error(error);
            alert("Submission failed");
            setSubmitting(false);
        }
    };

    if (!assessment || !attempt) return <MainLayout>Loading Assessment...</MainLayout>;

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{assessment.title}</h1>
                    <div className="text-gray-500 text-sm">Attempt ID: {attempt.id}</div>
                </div>

                <div className="space-y-8">
                    {assessment.questions?.map((q, index) => (
                        <Card key={q.id} className="p-6">
                            <div className="flex justify-between mb-4">
                                <span className="font-bold text-gray-700">Question {index + 1}</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{q.weight} pts</span>
                            </div>
                            <p className="text-lg text-gray-800 mb-4">{q.prompt}</p>

                            {q.question_type === 'MCQ' && q.options && (
                                <div className="space-y-2">
                                    {q.options.map((opt, i) => (
                                        <label key={i} className={`flex items-center p-3 rounded border cursor-pointer hover:bg-gray-50 ${answers[q.id] === opt ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name={`q-${q.id}`}
                                                value={opt}
                                                checked={answers[q.id] === opt}
                                                onChange={() => handleAnswerChange(q.id, opt)}
                                                className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {(q.question_type === 'OPEN_ENDED' || q.question_type === 'SCENARIO') && (
                                <textarea
                                    className="w-full border border-gray-300 rounded p-3 h-32 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    placeholder="Type your answer here..."
                                    value={answers[q.id] || ''}
                                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                                />
                            )}
                        </Card>
                    ))}
                </div>

                <div className="mt-8 mb-12 flex justify-end">
                    <Button onClick={handleSubmit} disabled={submitting} className="w-full md:w-auto px-8 py-3 text-lg">
                        {submitting ? 'Submitting...' : 'Submit Assessment'}
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
};

export default AssessmentTakingPage;
