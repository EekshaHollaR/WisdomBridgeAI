import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import type { KnowledgeModule, DecisionNode } from '../../types/knowledge';

const DecisionTreeVisual: React.FC<{ nodes: DecisionNode[] }> = ({ nodes }) => {
    if (!nodes || nodes.length === 0) return <p className="text-gray-400 italic">No decision tree available.</p>;

    return (
        <div className="space-y-4">
            {nodes.map(node => (
                <div key={node.id} className="border p-3 rounded bg-white">
                    <p className="font-semibold text-gray-800">Prompt: {node.prompt}</p>
                    {node.notes && <p className="text-sm text-gray-500 mt-1">{node.notes}</p>}
                    <div className="flex mt-2 text-sm">
                        <span className="text-green-600 mr-4">Yes &rarr; {node.next_if_yes ? "Next Step" : "End"}</span>
                        <span className="text-red-600">No &rarr; {node.next_if_no ? "Alternative" : "End"}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const KnowledgeModuleDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [module, setModule] = useState<KnowledgeModule | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            api.get(`/api/knowledge/modules/${id}/`)
                .then(res => setModule(res.data))
                .catch(err => console.error(err));
        }
    }, [id]);

    const handleStartPractice = async (scenarioId: number) => {
        try {
            const res = await api.post('/api/mentorship/sessions/start_session/', { scenario_id: scenarioId });
            navigate(`/dashboard/mentorship/session/${res.data.id}`);
        } catch (error) {
            console.error("Failed to start session", error);
            alert("Could not start practice session.");
        }
    };

    if (!module) return <MainLayout>Loading...</MainLayout>;

    return (
        <MainLayout>
            <Button variant="ghost" onClick={() => navigate('/dashboard/knowledge/modules')} className="mb-4">&larr; Back to Library</Button>

            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <span className={`text-xs px-2 py-1 rounded font-bold mb-2 inline-block ${module.difficulty_level === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                            module.difficulty_level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                            {module.difficulty_level}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{module.title}</h1>
                        <p className="text-gray-700 text-lg">{module.description}</p>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-bold mb-3">Learning Objectives</h3>
                    <ul className="list-disc list-inside text-gray-600">
                        {module.objectives.map((obj, idx) => <li key={idx}>{obj}</li>)}
                    </ul>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Scenarios</h2>
                    <div className="space-y-4">
                        {module.scenarios.map(scen => (
                            <Card key={scen.id}>
                                <h3 className="font-bold text-lg mb-2">{scen.title}</h3>
                                <p className="text-sm text-gray-600 mb-3">{scen.situation_prompt}</p>
                                <div className="text-xs bg-indigo-50 text-indigo-700 p-2 rounded mb-3">
                                    <strong>Expert Approach:</strong> {scen.recommended_approach}
                                </div>
                                <Button size="sm" onClick={() => handleStartPractice(scen.id)}>
                                    Start Practice Session
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-4">Decision Framework</h2>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <DecisionTreeVisual nodes={module.decision_tree} />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default KnowledgeModuleDetailPage;
