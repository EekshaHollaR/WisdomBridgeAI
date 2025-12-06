import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/auth/login/', { username, password });
            await login(response.data.access, response.data.refresh);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <MainLayout>
            <div className="max-w-md mx-auto mt-10">
                <Card>
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                    {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            id="username"
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                        <Button type="submit" className="w-full">Sign In</Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Don't have an account? <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">Sign up</Link>
                    </p>
                </Card>
            </div>
        </MainLayout>
    );
};

export default Login;
