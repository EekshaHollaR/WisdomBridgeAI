import React, { useState } from 'react';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';

const VirtualExpertPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setResponse(null);
        try {
            // POST /api/mentorship/virtual-expert/ask/
            const res = await api.post('/api/mentorship/virtual-expert/ask/', {
                query,
                context: "Learner is asking about software architecture." // Can be dynamic
            });
            setResponse(res.data.answer);
        } catch (error) {
            console.error(error);
            setResponse("The expert is currently unavailable.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <h1 className="text-3xl font-bold mb-6">Ask a Virtual Expert</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <Card className="p-6 bg-blue-50 border-blue-100 mb-6">
                        <h2 className="font-bold text-blue-900 mb-2">Expert Persona: Senior Systems Architect</h2>
                        <p className="text-blue-800 text-sm">
                            Ask me about complex system design, trade-offs, scalability, and legacy migration.
                            I'll give you direct, experience-based advice.
                        </p>
                    </Card>

                    <Card className="p-6">
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 h-40 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
                            placeholder="e.g., How should I handle database migrations in a microservices environment without downtime?"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                        <Button onClick={handleAsk} disabled={loading || !query.trim()} className="w-full">
                            {loading ? 'Consulting Expert...' : 'Ask Expert'}
                        </Button>
                    </Card>
                </div>

                <div>
                    {response ? (
                        <Card className="p-6 bg-white shadow-lg border-l-4 border-blue-600 h-full">
                            <h3 className="font-bold text-gray-800 mb-4">Expert Advice:</h3>
                            <div className="prose prose-blue text-gray-700 whitespace-pre-wrap">
                                {response}
                            </div>
                        </Card>
                    ) : (
                        <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-12 text-gray-400">
                            Result will appear here...
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default VirtualExpertPage;
