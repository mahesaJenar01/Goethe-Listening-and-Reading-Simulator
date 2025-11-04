import React from 'react';
import { Link } from 'react-router-dom';

interface AllExamsCompletedProps {
  examType: 'listening' | 'reading' | undefined;
}

const AllExamsCompleted: React.FC<AllExamsCompletedProps> = ({ examType }) => {
  const examName = examType === 'listening' ? 'Hören' : 'Lesen';

  return (
    <div className="max-w-2xl mx-auto text-center bg-white p-10 rounded-2xl shadow-lg border border-slate-200/80">
      <div className="text-6xl mb-6">🎉</div>
      <h2 className="text-3xl font-bold text-slate-800">Fantastische Arbeit!</h2>
      <p className="mt-4 text-slate-600 text-lg">
        Sie haben alle verfügbaren Übungsprüfungen für den Bereich{' '}
        <span className="font-bold text-sky-600">{examName}</span> abgeschlossen.
      </p>
      <p className="mt-2 text-slate-500">
        Kommen Sie später wieder, um neue Prüfungen zu entdecken. Machen Sie weiter so!
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="px-8 py-4 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          Zurück zur Auswahl
        </Link>
      </div>
    </div>
  );
};

export default AllExamsCompleted;