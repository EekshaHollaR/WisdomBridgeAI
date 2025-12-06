import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Card } from '../../components/UI/Card';
import type { LearningPath } from '../../types/knowledge';

const LearningPathsPage: React.FC = () => {
    const [paths, setPaths] = useState<LearningPath[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/knowledge/paths/')
            .then(res => setPaths(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <MainLayout>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Learning Paths</h1>
            <div className="grid gap-6">
                {paths.map(path => (
                    <Card key={path.id} className="hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{path.name}</h3>
                                <p className="text-gray-500">Target Role: {path.target_role}</p>
                            </div>
                            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                Start Path
                            </button>
                        </div>
                        <p className="text-gray-600 mb-4">{path.description}</p>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-sm text-gray-500 uppercase mb-3">Modules in this path</h4>
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {path.modules.map((mod, idx) => (
                                    <div key={mod.id} className="flex-shrink-0 w-64 bg-white border rounded p-3 cursor-pointer hover:border-indigo-300" onClick={() => navigate(`/dashboard/knowledge/modules/${mod.id}`)}>
                                        <div className="text-xs font-bold text-gray-400 mb-1">Step {idx + 1}</div>
                                        <div className="font-bold text-gray-800 truncate">{mod.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">{mod.difficulty_level}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </MainLayout>
    );
};

export default LearningPathsPage;
