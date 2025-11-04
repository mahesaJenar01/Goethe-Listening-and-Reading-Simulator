import React from 'react';
import { TrueFalseQuestion } from '../types';

interface TrueFalseCardProps {
  aufgabe: TrueFalseQuestion;
  questionNumber: number;
  userAnswer: boolean | undefined;
  isSubmitted: boolean;
  onAnswerChange: (questionId: string, answer: boolean) => void;
}

export const TrueFalseCard: React.FC<TrueFalseCardProps> = ({ aufgabe, questionNumber, userAnswer, isSubmitted, onAnswerChange }) => {

  const getOptionClasses = (isTrueOption: boolean) => {
    if (!isSubmitted) {
      return 'border-slate-300 hover:border-sky-500 hover:bg-sky-50';
    }
    if (isTrueOption === aufgabe.correctAnswer) {
      return 'border-emerald-500 bg-emerald-50';
    }
    if (isTrueOption === userAnswer) {
      return 'border-red-500 bg-red-50';
    }
    return 'border-slate-300';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full border border-slate-200/80">
      <p className="text-sm font-medium text-sky-600">Aufgabe {questionNumber}</p>
      <p className="text-lg font-semibold text-slate-800 mt-2">{aufgabe.statement}</p>
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[true, false].map((value) => (
          <label 
            key={value.toString()} 
            className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${getOptionClasses(value)}`}
          >
            <input
              type="radio"
              name={`question-${aufgabe.id}`}
              checked={userAnswer === value}
              onChange={() => onAnswerChange(aufgabe.id, value)}
              disabled={isSubmitted}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300"
            />
            <span className="ml-3 text-md font-semibold text-slate-700">
              {value ? 'Richtig' : 'Falsch'}
            </span>
          </label>
        ))}
      </div>
      
      {/* NEW: Display explanation directly in the card when the exam is submitted */}
      {isSubmitted && aufgabe.explanation && (
        <div className="mt-4 text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-200">
          <span className="font-bold text-slate-800">Erklärung:</span> {aufgabe.explanation}
        </div>
      )}
    </div>
  );
};