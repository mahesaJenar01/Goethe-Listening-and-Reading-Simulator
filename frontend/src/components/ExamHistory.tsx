import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ExamHistoryItem } from '../types';

const API_BASE_URL = 'http://127.0.0.1:5000';

const ExamHistory: React.FC = () => {
  const { userId } = useAuth();
  const [history, setHistory] = useState<ExamHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/exam-history?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch exam history.');
        const data: ExamHistoryItem[] = await response.json();
        setHistory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  if (isLoading) return <p className="text-center text-slate-600 mt-10">Lade Verlauf...</p>;
  if (error) return <p className="text-center text-red-600 font-semibold mt-10">{error}</p>;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800">Prüfungsverlauf</h2>
        <p className="mt-2 text-slate-600">Überprüfen Sie hier Ihre vergangenen Prüfungsergebnisse.</p>
      </div>

      {history.length === 0 ? (
        <p className="text-center text-slate-500 bg-white p-8 rounded-2xl shadow-lg border">
          Sie haben noch keine Prüfungen abgeschlossen.
        </p>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 space-y-4">
          {history.map((item) => {
            const percentage = Math.round((item.totalScore / item.totalQuestions) * 100);
            const isListening = item.examType === 'listening';
            const accentColor = isListening ? 'border-sky-500' : 'border-emerald-500';
            const examTypeText = isListening ? 'Hören' : 'Lesen';

            return (
              <Link
                key={item.timestamp}
                to={`/history/${item.timestamp}`}
                className={`block p-4 rounded-lg border-l-8 transition-all duration-200 hover:shadow-md hover:bg-slate-50 ${accentColor}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`font-bold text-lg ${isListening ? 'text-sky-700' : 'text-emerald-700'}`}>
                      {examTypeText} Prüfung
                    </span>
                    <p className="text-sm text-slate-500">{item.date}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-bold text-slate-800">{percentage}%</p>
                     <p className="text-sm text-slate-600 font-medium">
                        {item.totalScore} / {item.totalQuestions} Richtig
                     </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
       <div className="text-center mt-8">
            <Link to="/" className="px-6 py-3 font-semibold rounded-lg shadow-md transition-colors duration-200 bg-slate-200 text-slate-800 hover:bg-slate-300">
                Zurück zum Dashboard
            </Link>
        </div>
    </div>
  );
};

export default ExamHistory;