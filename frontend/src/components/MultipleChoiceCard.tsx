import React from 'react';
import { MultipleChoiceQuestion } from '../types';

interface MultipleChoiceCardProps {
  aufgabe: MultipleChoiceQuestion;
  questionNumber: number;
  userAnswer: number | undefined;
  isSubmitted: boolean;
  onAnswerChange: (questionId: string, answerIndex: number) => void;
}

const optionLabels = ['a', 'b', 'c'];

export const MultipleChoiceCard: React.FC<MultipleChoiceCardProps> = ({ aufgabe, questionNumber, userAnswer, isSubmitted, onAnswerChange }) => {

  // Defensive check: If aufgabe or aufgabe.options is missing, use an empty array to prevent crashing.
  const options = Array.isArray(aufgabe?.options) ? aufgabe.options : [];

  const getOptionClasses = (index: number) => {
    if (!isSubmitted) {
      return 'border-slate-300 hover:border-sky-500 hover:bg-sky-50';
    }
    if (index === aufgabe.correctAnswerIndex) {
      return 'border-emerald-500 bg-emerald-50';
    }
    if (index === userAnswer) {
      return 'border-red-500 bg-red-50';
    }
    return 'border-slate-300';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full border border-slate-200/80">
      <p className="text-sm font-medium text-sky-600">Aufgabe {questionNumber}</p>
      <p className="text-lg font-semibold text-slate-800 mt-2">{aufgabe.question}</p>
      
      <div className="mt-4 space-y-3">
        {/* This map is now safe from crashing */}
        {options.map((option, index) => (
          <label 
            key={index} 
            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${getOptionClasses(index)}`}
          >
            <input
              type="radio"
              name={`question-${aufgabe.id}`}
              checked={userAnswer === index}
              onChange={() => onAnswerChange(aufgabe.id, index)}
              disabled={isSubmitted}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300"
            />
            <span className="ml-4 text-md text-slate-700">
                <span className="font-bold">{optionLabels[index]})</span> {option}
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