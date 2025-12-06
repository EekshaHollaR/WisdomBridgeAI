import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import type { MentorshipSession, MentorshipMessage } from '../../types/mentorship';

const MentorshipSessionPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [session, setSession] = useState<MentorshipSession | null>(null);
    const [messages, setMessages] = useState<MentorshipMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) fetchSessionData();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchSessionData = async () => {
        try {
            const res = await api.get(`/api/mentorship/sessions/${id}/`);
            setSession(res.data);
            setMessages(res.data.messages || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const tempMsg: MentorshipMessage = {
            id: Date.now(),
            sender_type: 'learner',
            content: input,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post(`/api/mentorship/sessions/${id}/send_message/`, { content: tempMsg.content });
            setMessages(prev => [...prev, res.data]);
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setLoading(false);
        }
    };

    if (!session) return <MainLayout>Loading Session...</MainLayout>;

    return (
        <MainLayout>
            <div className="flex h-[calc(100vh-140px)] gap-6">
                {/* Chat Area - 70% width */}
                <div className="flex-grow flex flex-col w-2/3">
                    <div className="flex justify-between items-center mb-4">
                        <Button variant="ghost" onClick={() => navigate('/dashboard/mentorship')}>&larr; All Sessions</Button>
                        <h2 className="font-bold text-gray-700">Chat with AI Mentor</h2>
                    </div>

                    <Card className="flex-grow overflow-hidden flex flex-col p-0">
                        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender_type === 'learner' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-lg p-4 shadow-sm ${msg.sender_type === 'learner'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                        }`}>
                                        <div className="text-xs font-bold mb-1 opacity-75 uppercase tracking-wide">
                                            {msg.sender_type === 'ai' ? 'AI Mentor' : 'You'}
                                        </div>
                                        <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                                        <div className={`text-xs mt-1 text-right ${msg.sender_type === 'learner' ? 'text-indigo-200' : 'text-gray-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-200 text-gray-500 rounded-lg p-3 rounded-bl-none animate-pulse text-sm">
                                        Mentor is typing...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-gray-200 flex gap-3">
                            <input
                                className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="Type your response..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                disabled={loading}
                            />
                            <Button onClick={handleSend} disabled={loading || !input.trim()}>Send</Button>
                        </div>
                    </Card>
                </div>

                {/* Context Sidebar - 30% width */}
                <div className="w-1/3 hidden lg:flex flex-col">
                    <div className="mb-4 pt-10"></div> {/* Spacer to align with chat top */}
                    <Card className="flex-grow overflow-y-auto bg-gray-50 border-none shadow-inner">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Context</h3>

                        {session.module && (
                            <div className="mb-6">
                                <h4 className="font-bold text-gray-800 mb-1">{session.module.title}</h4>
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{session.module.difficulty_level}</span>
                                <div className="mt-3">
                                    <p className="text-sm text-gray-600 font-semibold mb-1">Objectives:</p>
                                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                                        {session.module.objectives.map((obj: string, i: number) => (
                                            <li key={i}>{obj}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {session.scenario && (
                            <div className="mb-6 border-t border-gray-200 pt-4">
                                <h4 className="font-bold text-gray-800 mb-2">Current Scenario</h4>
                                <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-700 mb-3">
                                    {session.scenario.situation_prompt}
                                </div>
                                <div className="bg-yellow-50 p-3 rounded border border-yellow-100 text-sm text-yellow-800">
                                    <strong>Risk to consider:</strong> {session.scenario.risks_to_consider}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="font-bold text-gray-800 mb-2">Personalization</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Learning Style:</span>
                                    <span className="font-medium text-gray-900">{session.personalization_context?.learning_style || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Clarity:</span>
                                    <span className="font-medium text-gray-900">{session.personalization_context?.clarity_level || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};

export default MentorshipSessionPage;
