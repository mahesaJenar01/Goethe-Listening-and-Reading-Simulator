import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import ExamSelector from './components/ExamSelector';
import ExamSession from './components/ExamSession';

const App: React.FC = () => {
  const location = useLocation();
  
  // Determine the exam type from the URL for the Header
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
            {/* Route for the main selection screen */}
            <Route path="/" element={<ExamSelector />} />

            {/* Route for the active exam session */}
            <Route path="/:examType/part/:partIndex" element={<ExamSession />} />
            
            {/* You could add other routes here later, e.g., for a user profile page */}
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;