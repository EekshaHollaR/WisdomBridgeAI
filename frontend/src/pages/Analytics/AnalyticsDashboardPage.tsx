import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Card } from '../../components/UI/Card';

interface AnalyticsData {
    stats: {
        total_modules: number;
        total_items: number;
        total_learners: number;
        total_sessions: number;
        avg_assessment_score: number;
    };
    charts: {
        sessions_by_expert: Array<{ expert__username: string, count: number }>;
        knowledge_gaps: Array<{ module__title: string, avg_score: number }>;
        score_distribution: Record<string, number>;
    };
}

const AnalyticsDashboardPage: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/analytics/dashboard/')
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <MainLayout>Loading Analytics...</MainLayout>;
    if (!data) return <MainLayout>Failed to load data.</MainLayout>;

    return (
        <MainLayout>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Analytics Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Knowledge Modules" value={data.stats.total_modules} color="bg-blue-50 text-blue-700" />
                <StatCard label="Captured Items" value={data.stats.total_items} color="bg-indigo-50 text-indigo-700" />
                <StatCard label="Active Learners" value={data.stats.total_learners} color="bg-green-50 text-green-700" />
                <StatCard label="Mentorship Sessions" value={data.stats.total_sessions} color="bg-purple-50 text-purple-700" />
                <StatCard label="Avg Assessment Score" value={`${data.stats.avg_assessment_score}%`} color="bg-yellow-50 text-yellow-700" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Knowledge Gaps */}
                <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Potential Knowledge Gaps</h3>
                    <p className="text-sm text-gray-500 mb-4">Modules with lowest average assessment scores.</p>
                    <div className="space-y-4">
                        {data.charts.knowledge_gaps.map((item, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{item.module__title}</span>
                                    <span className="font-bold">{Math.round(item.avg_score || 0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${item.avg_score || 0}%` }}></div>
                                </div>
                            </div>
                        ))}
                        {data.charts.knowledge_gaps.length === 0 && <p>No assessment data yet.</p>}
                    </div>
                </Card>

                {/* Score Distribution */}
                <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Assessment Score Distribution</h3>
                    <div className="flex items-end justify-between h-48 space-x-2">
                        {Object.entries(data.charts.score_distribution).map(([range, count]) => {
                            // Calculate height percentage relative to max, simplified
                            const maxVal = Math.max(...Object.values(data.charts.score_distribution), 1);
                            const height = (count / maxVal) * 100;
                            return (
                                <div key={range} className="flex flex-col items-center w-1/4">
                                    <div
                                        className="w-full bg-indigo-500 rounded-t transition-all duration-500"
                                        style={{ height: `${height}%` }}
                                    ></div>
                                    <div className="mt-2 text-xs font-bold">{range}</div>
                                    <div className="text-xs text-gray-500">{count}</div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};

const StatCard: React.FC<{ label: string, value: string | number, color: string }> = ({ label, value, color }) => (
    <Card className={`p-4 ${color} border-none`}>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-sm opacity-80">{label}</div>
    </Card>
);

export default AnalyticsDashboardPage;
