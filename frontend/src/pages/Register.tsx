import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'LEARNER'
    });
    const [profileData, setProfileData] = useState({
        title: '',
        department: '',
        role_title: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                ...formData,
                profile_data: {
                    department: profileData.department,
                    ...(formData.role === 'EXPERT'
                        ? {
                            title: profileData.title,
                            years_experience: 5,
                            domains_of_expertise: ["General"]
                        }
                        : {
                            role_title: profileData.role_title,
                            experience_level: "Intermediate",
                            learning_goals: ["Growth"]
                        }
                    )
                }
            };
            await api.post('/api/auth/register/', payload);
            navigate('/login');
        } catch (err: any) {
            console.error('Registration error:', err.response?.data);

            if (err.response?.data) {
                const errors = err.response.data;
                let errorMessage = '';

                if (errors.username) {
                    errorMessage = Array.isArray(errors.username) ? errors.username[0] : errors.username;
                } else if (errors.email) {
                    errorMessage = Array.isArray(errors.email) ? errors.email[0] : errors.email;
                } else if (errors.password) {
                    errorMessage = Array.isArray(errors.password) ? errors.password[0] : errors.password;
                } else if (errors.non_field_errors) {
                    errorMessage = Array.isArray(errors.non_field_errors) ? errors.non_field_errors[0] : errors.non_field_errors;
                } else {
                    errorMessage = 'Registration failed. Please check your inputs.';
                }

                setError(errorMessage);
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    return (
        <MainLayout>
            <div className="max-w-xl mx-auto mt-10">
                <Card>
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Join WisdomBridge</h2>
                    {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                autoComplete="username"
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <Input
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            autoComplete="new-password"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="LEARNER">Learner (Junior Employee)</option>
                                <option value="EXPERT">Expert (Senior/Retiring)</option>
                            </select>
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-md font-semibold mb-3 text-gray-700">Profile Details</h3>
                            <div className="space-y-4">
                                <Input
                                    label="Department"
                                    value={profileData.department}
                                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                />
                                {formData.role === 'EXPERT' ? (
                                    <Input
                                        label="Job Title"
                                        value={profileData.title}
                                        onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                                    />
                                ) : (
                                    <Input
                                        label="Current Role Title"
                                        value={profileData.role_title}
                                        onChange={(e) => setProfileData({ ...profileData, role_title: e.target.value })}
                                    />
                                )}
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-6">Create Account</Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-500">Login</Link>
                    </p>
                </Card>
            </div>
        </MainLayout>
    );
};

export default Register;
