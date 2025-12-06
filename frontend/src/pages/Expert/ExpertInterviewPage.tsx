import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import type { KnowledgeInterviewSession } from '../../types/knowledge';

const ExpertInterviewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [session, setSession] = useState<KnowledgeInterviewSession | null>(null);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) fetchSession(id);
    }, [id]);

    const fetchSession = async (sessionId: string) => {
        try {
            const res = await api.get(`/api/knowledge/sessions/${sessionId}/`);
            setSession(res.data);

            // Pre-fill answers if any (simplified)
            const existingAnswers: any = {};
            res.data.answers.forEach((ans: any) => {
                if (ans.question) existingAnswers[ans.question] = ans.answer_text;
            });
            setAnswers(existingAnswers);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveAnswers = async () => {
        if (!session) return;
        const payload = Object.keys(answers).map(qId => ({
            question_id: parseInt(qId),
            answer_text: answers[parseInt(qId)]
        }));

        try {
            await api.post(`/api/knowledge/sessions/${session.id}/add_answers/`, { answers: payload });
            alert('Answers saved!');
        } catch (error) {
            console.error('Failed to save answers', error);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!session || !event.target.files || event.target.files.length === 0) return;
        setUploading(true);
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('audio_file', file);

        try {
            await api.post(`/api/knowledge/sessions/${session.id}/process_audio/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchSession(session.id.toString());
            alert('Audio processed successfully!');
        } catch (error) {
            console.error('Audio processing failed', error);
            alert('Failed to process audio.');
        } finally {
            setUploading(false);
        }
    };

    if (!session) return <MainLayout>Loading...</MainLayout>;

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Button variant="ghost" className="mb-2" onClick={() => navigate('/dashboard/expert')}>&larr; Back</Button>
                    <h1 className="text-2xl font-bold">{session.title}</h1>
                    <p className="text-gray-500 text-sm">Status: {session.status}</p>
                </div>
                <div className="space-x-2">
                    <Button variant="outline" onClick={handleSaveAnswers}>Save Draft</Button>
                    <Button variant="primary">Finalize</Button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Interview Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Interview Questions</h2>
                    {session.questions.map((q) => (
                        <Card key={q.id} className="p-4">
                            <p className="font-medium text-gray-900 mb-3">{q.order}. {q.question_text}</p>
                            <textarea
                                className="w-full h-32 p-3 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Type your answer here or record audio below..."
                                value={answers[q.id] || ''}
                                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                            />
                        </Card>
                    ))}

                    <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
                        <h3 className="text-lg font-medium mb-2">Upload Audio Recording</h3>
                        <p className="text-sm text-gray-500 mb-4">Upload an exported interview recording (.mp3, .wav) to automatically transcribe and extract insights.</p>
                        <input type="file" accept="audio/*" onChange={handleFileUpload} disabled={uploading} />
                        {uploading && <p className="text-indigo-600 mt-2">Processing... This may take a minute.</p>}
                    </Card>
                </div>

                {/* Knowledge Artifacts Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800">Extracted Knowledge</h2>
                    {session.knowledge_items.length === 0 ? (
                        <div className="text-gray-500 italic p-4 bg-white rounded-lg border">
                            No knowledge items extracted yet. Process audio or finalizing the interview will generate these.
                        </div>
                    ) : (
                        session.knowledge_items.map(item => (
                            <Card key={item.id} className="border-l-4 border-l-indigo-500">
                                <div className="flex justify-between">
                                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full uppercase">{item.type}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{tag}</span>
                                    ))}
                                </div>
                            </Card>
                        ))
                    )}

                    {session.raw_transcript && (
                        <Card>
                            <h3 className="font-bold mb-2">Transcript Snippet</h3>
                            <p className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded whitespace-pre-wrap max-h-60 overflow-y-auto">
                                {session.raw_transcript.slice(0, 500)}...
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default ExpertInterviewPage;
