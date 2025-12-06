import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';

interface MentorshipMessage {
    id: number;
    sender_type: 'ai' | 'learner' | 'expert';
    content: string;
    created_at: string;
}

const MentorshipChatPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Session ID
    const [messages, setMessages] = useState<MentorshipMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) fetchMessages();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/api/mentorship/sessions/${id}/`);
            setMessages(res.data.messages);
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
            // Replace/Add AI response
            setMessages(prev => [...prev, res.data]);
        } catch (error) {
            console.error("Failed to send message", error);
            // Optionally remove temp message or show error
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="flex flex-col h-[calc(100vh-140px)]">
                <div className="flex justify-between items-center mb-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>&larr; Back</Button>
                    <h1 className="text-xl font-bold">Mentorship Session</h1>
                    <div className="w-20"></div> {/* Spacer */}
                </div>

                <Card className="flex-grow overflow-hidden flex flex-col p-0">
                    <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender_type === 'learner' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-4 shadow-sm ${msg.sender_type === 'learner'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                    }`}>
                                    <div className="text-sm font-semibold mb-1 opacity-75">
                                        {msg.sender_type === 'ai' ? 'AI Mentor' : msg.sender_type === 'expert' ? 'Expert' : 'You'}
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
                                <div className="bg-gray-200 text-gray-500 rounded-lg p-3 rounded-bl-none animate-pulse">
                                    Mentor is typing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-gray-200 flex gap-4">
                        <input
                            type="text"
                            className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="Type your response..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            disabled={loading}
                        />
                        <Button onClick={handleSend} disabled={loading || !input.trim()}>
                            Send
                        </Button>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};

export default MentorshipChatPage;
