import React from 'react';

interface ResultsProps {
  score: number;
  total: number;
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ score, total, onRestart }) => {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const getFeedback = () => {
    if (percentage === 100) return { text: "Ausgezeichnet! Perfekte Punktzahl!", color: "text-emerald-500" };
    if (percentage >= 80) return { text: "Sehr gut! Fast alles richtig.", color: "text-sky-500" };
    if (percentage >= 60) return { text: "Gut gemacht! Übung macht den Meister.", color: "text-yellow-500" };
    return { text: "Weiter so! Jede Übung ist ein Schritt vorwärts.", color: "text-slate-600" };
  };
  
  const feedback = getFeedback();

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl text-center border border-slate-200/80">
      <h2 className="text-3xl font-bold text-slate-800">Prüfung abgeschlossen!</h2>
      <p className="text-slate-500 mt-2">Hier ist Ihr Ergebnis:</p>
      
      <div className="my-8">
        <div className={`text-7xl font-bold ${feedback.color}`}>{percentage}%</div>
        <div className="text-2xl font-semibold text-slate-700 mt-2">
          {score} / {total} richtige Antworten
        </div>
      </div>

      <p className={`text-lg font-medium mb-8 ${feedback.color}`}>{feedback.text}</p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestart}
          className="px-6 py-3 text-base font-semibold rounded-lg shadow-md transition-all duration-300 bg-slate-200 text-slate-800 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
        >
          Nochmal versuchen
        </button>
      </div>
    </div>
  );
};

export default Results;