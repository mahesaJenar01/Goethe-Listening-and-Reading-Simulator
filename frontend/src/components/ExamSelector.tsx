import React from 'react';
import { Link } from 'react-router-dom'; // NEW: Import Link

const ExamSelector: React.FC = () => {
  // NEW: Clear any previous exam session when returning to this page
  const handleSelection = () => {
    localStorage.removeItem('examSession');
  };

  return (
    <div className="max-w-2xl mx-auto text-center bg-white p-10 rounded-2xl shadow-lg border border-slate-200/80">
      <h2 className="text-3xl font-bold text-slate-800">Wählen Sie Ihre Prüfung</h2>
      <p className="mt-2 text-slate-600">Welchen Teil möchten Sie üben?</p>
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-6">
        {/* UPDATED: Buttons are now Links */}
        <Link
          to="/listening/part/1"
          onClick={handleSelection}
          className="px-8 py-4 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          Hören
        </Link>
        <Link
          to="/reading/part/1"
          onClick={handleSelection}
          className="px-8 py-4 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          Lesen
        </Link>
      </div>
    </div>
  );
};

export default ExamSelector;