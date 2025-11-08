import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';         // NEW: Import Dashboard
import ExamSession from './components/ExamSession';
import Auth from './components/Auth';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const location = useLocation();
  const { userId } = useAuth();
  
  const getExamTypeFromPath = (): 'listening' | 'reading' | null => {
    if (location.pathname.startsWith('/listening')) return 'listening';
    if (location.pathname.startsWith('/reading')) return 'reading';
    return null;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Header examType={getExamTypeFromPath()} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Routes>
            {userId ? (
              // Routes accessible only when logged in
              <>
                {/* UPDATED: The home route now points to the Dashboard */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/:examType/part/:partIndex" element={<ExamSession />} />
                {/* Redirect any other path to home when logged in */}
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              // Routes accessible only when logged out
              <>
                <Route path="/login" element={<Auth />} />
                {/* Redirect any other path to login when logged out */}
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;