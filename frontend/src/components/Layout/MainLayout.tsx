import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../UI/Button';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <Link to="/" className="text-xl font-bold text-indigo-600">WisdomBridge AI</Link>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-indigo-600">Dashboard</Link>
                                {user.role === 'EXPERT' && (
                                    <Link to="/dashboard/expert" className="text-sm font-medium text-gray-700 hover:text-indigo-600">Expert Studio</Link>
                                )}
                                <span className="h-4 w-px bg-gray-300 mx-2"></span>
                                <span className="text-sm text-gray-600">
                                    {user.username} <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{user.role}</span>
                                </span>
                                <Button variant="outline" size="sm" onClick={() => logout()}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
                                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>Sign Up</Button>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children}
            </main>
            <footer className="bg-white border-t border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    © 2024 WisdomBridge AI. Built for OpenAI Buildathon.
                </div>
            </footer>
        </div>
    );
};
