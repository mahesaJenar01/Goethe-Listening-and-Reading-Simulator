import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://127.0.0.1:5000';

const Auth: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const endpoint = isLoginView ? '/api/login' : '/api/register';
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `An error occurred: ${response.statusText}`);
            }

            if (isLoginView) {
                login(data.userId);
            } else {
                // After successful registration, prompt user to login
                setIsLoginView(true);
                setUsername('');
                setPassword('');
                alert('Registration successful! Please log in.');
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-6">
                {isLoginView ? 'Login' : 'Register'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-white font-semibold bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400"
                    >
                        {isLoading ? 'Processing...' : (isLoginView ? 'Login' : 'Register')}
                    </button>
                </div>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
                {isLoginView ? "Don't have an account?" : 'Already have an account?'}
                <button
                    onClick={() => {
                      setIsLoginView(!isLoginView);
                      setError(null);
                    }}
                    className="ml-2 font-medium text-sky-600 hover:text-sky-500"
                >
                    {isLoginView ? 'Register' : 'Login'}
                </button>
            </p>
        </div>
    );
};

export default Auth;