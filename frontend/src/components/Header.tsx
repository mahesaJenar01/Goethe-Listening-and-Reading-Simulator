// components/Header.tsx

import React from 'react';

interface HeaderProps {
  examType: 'listening' | 'reading' | null;
}

const Header: React.FC<HeaderProps> = ({ examType }) => {
  const title = examType === 'listening' ? 'Hörenprüfung' : examType === 'reading' ? 'Lesenprüfung' : 'Prüfungstrainer';

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-10 h-10 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0M18.364 18.364A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          <h1 className="text-2xl font-bold text-slate-800">Goethe {title}</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;