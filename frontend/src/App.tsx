import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ExamSession from './components/ExamSession';
import Auth from './components/Auth';
import { useAuth } from './contexts/AuthContext';
import ExamHistory from './components/ExamHistory';
import DetailedResultsView from './components/DetailedResultsView';

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
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/:examType/part/:partIndex" element={<ExamSession />} />
                {/* --- NEW ROUTES --- */}
                <Route path="/history" element={<ExamHistory />} />
                <Route path="/history/:examTimestamp" element={<DetailedResultsView />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<Auth />} />
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