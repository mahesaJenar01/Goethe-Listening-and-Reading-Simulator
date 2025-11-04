// components/ReadingAssignmentCard.tsx

import React from 'react';
import { ReadingPart3, Situation } from '../types';

interface ReadingAssignmentCardProps {
  part: ReadingPart3;
  userAnswers: { [key: string]: string };
  isSubmitted: boolean;
  onAnswerChange: (situationId: string, advertisementKey: string) => void;
}

export const ReadingAssignmentCard: React.FC<ReadingAssignmentCardProps> = ({ part, userAnswers, isSubmitted, onAnswerChange }) => {

  const getOptionClasses = (situation: Situation, optionKey: string) => {
    if (!isSubmitted) return '';
    if (situation.correctAnswer === optionKey) return 'text-emerald-700 font-bold';
    if (userAnswers[situation.id] === optionKey) return 'text-red-700';
    return 'text-slate-500';
  };
  
  const usedAnswers = new Set(Object.values(userAnswers));

  return (
    <div className="space-y-8">
      {/* Advertisements Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Anzeigen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {part.advertisements.map(ad => (
            <div key={ad.key} className="p-4 border rounded-lg bg-slate-50">
              <p className="font-bold text-sky-700">Anzeige {ad.key}</p>
              <p className="text-md font-semibold text-slate-800 mt-1">{ad.title}</p>
              <p className="text-sm text-slate-600 mt-2">{ad.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Situations/Questions Section */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
            {/* Example */}
            <div className="p-4 rounded-lg bg-slate-100/80 flex items-center gap-4">
                <span className="font-bold text-slate-600 text-lg w-8 text-center">{part.example.number}</span>
                <div className="flex-1">
                    <p className="text-slate-700">{part.example.description}</p>
                </div>
                <div className="font-bold text-emerald-600 text-lg px-4 py-2 bg-emerald-100 rounded-md">
                   Anzeige {part.example.correctAnswer}
                </div>
            </div>
        </div>
        
        {part.situations.map(sit => (
          <div key={sit.id} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="font-bold text-sky-600 text-lg w-8 text-center">{sit.number}</span>
              <p className="flex-1 text-slate-800">{sit.description}</p>
              <select
                value={userAnswers[sit.id] || ''}
                onChange={(e) => onAnswerChange(sit.id, e.target.value)}
                disabled={isSubmitted}
                className="p-2 border-2 rounded-md focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-100"
              >
                <option value="" disabled>Wählen</option>
                {part.advertisements.map(ad => {
                    const isSelectedByOther = usedAnswers.has(ad.key) && userAnswers[sit.id] !== ad.key;
                    return (
                        <option 
                            key={ad.key} 
                            value={ad.key}
                            disabled={isSelectedByOther}
                            className={isSelectedByOther ? 'text-slate-400' : ''}
                        >
                            Anzeige {ad.key}
                        </option>
                    )
                })}
                <option value="0">Keine Anzeige (0)</option>
              </select>
            </div>
            {isSubmitted && (
              <div className="mt-4 text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-200">
                  <p>
                    <span className="font-bold">Richtige Antwort: </span>
                    <span className="font-bold text-emerald-700">{sit.correctAnswer === '0' ? '0' : `Anzeige ${sit.correctAnswer}`}</span>
                  </p>
                  <p className="mt-2"><span className="font-bold text-slate-800">Erklärung:</span> {sit.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};