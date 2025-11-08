import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardStats, StatData } from '../types';
import PerformanceChart from './PerformanceChart';

const API_BASE_URL = 'http://127.0.0.1:5000';

const Dashboard: React.FC = () => {
    const { userId } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/dashboard-stats?userId=${userId}`);
                if (!response.ok) throw new Error('Failed to fetch dashboard data.');
                const data = await response.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [userId]);

    const handleSelection = () => {
        localStorage.removeItem('examSession');
    };

    const renderStatCard = (type: 'listening' | 'reading', data: StatData | undefined) => {
        // This function remains exactly the same as before
        const isListening = type === 'listening';
        const title = isListening ? 'Hören' : 'Lesen';
        const bgColor = isListening ? 'bg-sky-100/80' : 'bg-emerald-100/80';
        const accentColor = isListening ? 'text-sky-700' : 'text-emerald-700';
        const progressBg = isListening ? 'bg-sky-600' : 'bg-emerald-600';
        
        if (!data) return null;
        
        const progressPercentage = data.totalExams > 0 ? (data.completedExams / data.totalExams) * 100 : 0;

        return (
            <div className={`p-6 rounded-2xl shadow-lg border border-slate-200/80 ${bgColor}`}>
                <h3 className={`text-2xl font-bold ${accentColor}`}>{title}</h3>
                <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-baseline">
                        <span className="text-slate-600 font-medium">Durchschnittsnote</span>
                        <span className={`text-3xl font-bold ${accentColor}`}>{data.averageScore}%</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-slate-600 font-medium">Abgeschlossene Prüfungen</span>
                        <span className="text-xl font-semibold text-slate-700">{data.completedExams} / {data.totalExams}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                         <div className={`${progressBg} h-2.5 rounded-full`} style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return <p className="text-center text-slate-600 mt-10">Dashboard wird geladen...</p>;
    }
    if (error) {
        return <p className="text-center text-red-600 font-semibold mt-10">{error}</p>;
    }

    return (
        <div className="space-y-12">
            <div>
                 <h2 className="text-3xl font-bold text-slate-800">Willkommen zurück, {userId}!</h2>
                 <p className="mt-2 text-slate-600">Hier ist eine Übersicht über Ihren Fortschritt.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {stats && renderStatCard('listening', stats.listening)}
                {stats && renderStatCard('reading', stats.reading)}
            </div>

            {/* --- NEW: Chart Section --- */}
            {stats && stats.performanceTrend.length > 1 && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80" style={{ height: '400px' }}>
                    <PerformanceChart trendData={stats.performanceTrend} />
                </div>
            )}
            
            {/* --- Exam Selection Section (remains the same) --- */}
            <div className="max-w-2xl mx-auto text-center bg-white p-10 rounded-2xl shadow-lg border border-slate-200/80">
                <h2 className="text-3xl font-bold text-slate-800">Wählen Sie Ihre Prüfung</h2>
                <p className="mt-2 text-slate-600">Welchen Teil möchten Sie als Nächstes üben?</p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-6">
                    <Link to="/listening/part/1" onClick={handleSelection} className="px-8 py-4 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                        Hören
                    </Link>
                    <Link to="/reading/part/1" onClick={handleSelection} className="px-8 py-4 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                        Lesen
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;