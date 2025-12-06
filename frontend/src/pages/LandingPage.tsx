import React from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { Button } from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <MainLayout>
            <div className="text-center py-20">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                    Bridge the Generational Knowledge Gap
                </h1>
                <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                    WisdomBridge AI captures expert knowledge before it retires and transfers it
                    to the next generation through adaptive, AI-guided mentorship.
                </p>
                <div className="flex justify-center space-x-4">
                    <Button size="lg" onClick={() => navigate('/register')}>Get Started</Button>
                    <Button variant="outline" size="lg" onClick={() => navigate('/login')}>Login</Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-3 text-indigo-600">Capture</h3>
                    <p className="text-gray-600">Conduct AI-led interviews with retiring experts to extract tacit knowledge.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-3 text-indigo-600">Structure</h3>
                    <p className="text-gray-600">Automatically organize insights into learning modules and decision scenarios.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-3 text-indigo-600">Mentor</h3>
                    <p className="text-gray-600">Deliver personalized mentorship to juniors via an interactive AI avatar.</p>
                </div>
            </div>
        </MainLayout>
    );
};

export default LandingPage;
