import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../UI/Button';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname.startsWith(path);

    const NavItem = ({ to, label }: { to: string, label: string }) => (
        <Link
            to={to}
            className={`block px-4 py-2 rounded-md mb-1 text-sm font-medium transition-colors ${isActive(to)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            {label}
        </Link>
    );

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-indigo-600">WisdomBridge AI</h1>
                    <p className="text-xs text-gray-500 mt-1">Intergenerational Learning</p>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    <div className="mb-6">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Dashboard
                        </p>
                        <NavItem to="/dashboard" label="Overview" />
                    </div>

                    <div className="mb-6">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Knowledge
                        </p>
                        <NavItem to="/dashboard/modules" label="Learning Modules" />
                        {user?.role === 'EXPERT' && (
                            <NavItem to="/dashboard/interviews" label="Expert Studio" />
                        )}
                    </div>

                    <div className="mb-6">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Growth
                        </p>
                        <NavItem to="/dashboard/mentorship" label="Mentorship Sessions" />
                        <NavItem to="/dashboard/assessments" label="Assessments" />
                        <NavItem to="/dashboard/expert/ask" label="Virtual Expert" />
                    </div>

                    <div className="mb-6">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Insights
                        </p>
                        <NavItem to="/dashboard/analytics" label="Analytics" />
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {user?.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="w-full text-xs">
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
};
