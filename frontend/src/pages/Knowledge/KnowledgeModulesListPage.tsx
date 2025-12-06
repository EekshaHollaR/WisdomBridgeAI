import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Card } from '../../components/UI/Card';
import type { KnowledgeModule } from '../../types/knowledge';

const KnowledgeModulesListPage: React.FC = () => {
    const [modules, setModules] = useState<KnowledgeModule[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/knowledge/modules/')
            .then(res => setModules(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <MainLayout>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Knowledge Library</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(mod => (
                    <Card key={mod.id} className="cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate(`/dashboard/knowledge/modules/${mod.id}`)}>
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs px-2 py-1 rounded font-bold ${mod.difficulty_level === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                                    mod.difficulty_level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                }`}>
                                {mod.difficulty_level}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{mod.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{mod.description}</p>
                        <div className="text-sm text-gray-500">
                            {mod.scenarios?.length || 0} Scenarios • {mod.objectives?.length || 0} Objectives
                        </div>
                    </Card>
                ))}
            </div>
        </MainLayout>
    );
};

export default KnowledgeModulesListPage;
