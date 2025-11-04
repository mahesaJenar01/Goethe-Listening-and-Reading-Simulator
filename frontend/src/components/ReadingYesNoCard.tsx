import React from 'react';
import { ReadingPart4, Opinion } from '../types';

interface ReadingYesNoCardProps {
  part: ReadingPart4;
  userAnswers: { [key:string]: boolean };
  isSubmitted: boolean;
  onAnswerChange: (opinionId: string, answer: boolean) => void;
}

export const ReadingYesNoCard: React.FC<ReadingYesNoCardProps> = ({ part, userAnswers, isSubmitted, onAnswerChange }) => {
  
  const getOptionClasses = (isTrueOption: boolean, opinion: Opinion) => {
    if (!isSubmitted) {
      return 'border-slate-300 hover:border-sky-500 hover:bg-sky-50';
    }
    if (isTrueOption === opinion.correctAnswer) {
      return 'border-emerald-500 bg-emerald-50';
    }
    if (isTrueOption === userAnswers[opinion.id]) {
      return 'border-red-500 bg-red-50';
    }
    return 'border-slate-300';
  };
  
  return (
    <div className="space-y-6">
      {/* Forum Topic Section */}
      <article className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80">
        <header className="border-b pb-4 mb-6">
          <p className="text-sm font-medium text-sky-600">Thema</p>
          <h1 className="text-2xl font-bold text-slate-800 leading-tight mt-2">{part.topic}</h1>
        </header>
        <div className="prose max-w-none text-slate-700 leading-relaxed space-y-4">
          <p>{part.introduction}</p>
        </div>
      </article>

      {/* Opinions Section */}
      <div className="space-y-4">
        {/* Example */}
        {!isSubmitted && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 opacity-90">
                <p className="text-sm font-medium text-sky-600">Beispiel</p>
                <div className="flex items-start gap-4 mt-2">
                    {/* UPDATED: Improved display logic for the example */}
                    <span className="font-bold text-slate-800">
                      {part.example.number === 0 ? `(${part.example.name})` : `${part.example.number}. ${part.example.name}`}:
                    </span>
                    <p className="flex-1 text-slate-700 italic">"{part.example.text}"</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className={`flex items-center justify-center p-3 rounded-lg border-2 ${part.example.correctAnswer ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}>
                        <input type="radio" checked={part.example.correctAnswer} disabled className="h-4 w-4 text-sky-600"/>
                        <span className="ml-3 text-md font-semibold text-slate-700">Ja</span>
                    </div>
                    <div className={`flex items-center justify-center p-3 rounded-lg border-2 ${!part.example.correctAnswer ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}>
                        <input type="radio" checked={!part.example.correctAnswer} disabled className="h-4 w-4 text-sky-600"/>
                        <span className="ml-3 text-md font-semibold text-slate-700">Nein</span>
                    </div>
                </div>
            </div>
        )}

        {/* Mapped Opinions */}
        {part.opinions.map(opinion => (
          <div key={opinion.id} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
            <div className="flex items-start gap-4">
              <span className="font-bold text-slate-800">{opinion.number}. {opinion.name}:</span>
              <p className="flex-1 text-slate-700 italic">"{opinion.text}"</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {[true, false].map(value => (
                <label 
                  key={value.toString()} 
                  className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${getOptionClasses(value, opinion)}`}
                >
                  <input
                    type="radio"
                    name={`opinion-${opinion.id}`}
                    checked={userAnswers[opinion.id] === value}
                    onChange={() => onAnswerChange(opinion.id, value)}
                    disabled={isSubmitted}
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                  />
                  <span className="ml-3 text-md font-semibold text-slate-700">{value ? 'Ja' : 'Nein'}</span>
                </label>
              ))}
            </div>
            {isSubmitted && opinion.explanation && (
              <div className="mt-4 text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-200">
                <span className="font-bold text-slate-800">Erklärung:</span> {opinion.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};