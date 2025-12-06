import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <MainLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.username}.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold mb-2">My Profile</h3>
                    <p className="text-sm text-gray-500 mb-4">Manage your personal information and expertise settings.</p>
                    <div className="text-sm">
                        <p><strong>Role:</strong> {user?.role}</p>
                        {/* Profile details would be fetched and shown here */}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold mb-2">My Modules</h3>
                    <p className="text-sm text-gray-500 mb-4">Access your learning content and mentorship sessions.</p>
                    <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        No active modules
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                    <div className="text-sm text-gray-500">
                        No new notifications.
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
