import React from 'react';
import { SpeakerAssignmentQuestion, Speaker } from '../types';

interface SpeakerAssignmentCardProps {
  aufgabe: SpeakerAssignmentQuestion;
  speakers: Speaker[];
  questionNumber: number;
  userAnswer: string | undefined; // The answer is the speaker key (string)
  isSubmitted: boolean;
  onAnswerChange: (questionId: string, answer: string) => void;
}

export const SpeakerAssignmentCard: React.FC<SpeakerAssignmentCardProps> = ({ 
  aufgabe, 
  speakers, 
  questionNumber, 
  userAnswer, 
  isSubmitted, 
  onAnswerChange 
}) => {

  const getOptionClasses = (speakerKey: string) => {
    const isCorrect = speakerKey === aufgabe.correctAnswer;
    const isUserSelection = speakerKey === userAnswer;

    if (!isSubmitted) {
      // Not submitted: default styling
      return 'border-slate-300 hover:border-sky-500 hover:bg-sky-50';
    }
    
    if (isCorrect) {
      // Correct answer
      return 'border-emerald-500 bg-emerald-50';
    }
    
    if (isUserSelection && !isCorrect) {
      // Incorrect selection by user
      return 'border-red-500 bg-red-50';
    }
    
    // Other options (not selected, not correct)
    return 'border-slate-300';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full border border-slate-200/80">
      <p className="text-sm font-medium text-sky-600">Aufgabe {questionNumber}</p>
      {/* FIX: This renders the missing statement text */}
      <p className="text-lg font-semibold text-slate-800 mt-2">{aufgabe.statement}</p>
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* FIX: This maps the correct speaker names from the speakers prop */}
        {speakers.map((speaker) => (
          <label 
            key={speaker.key} 
            className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${getOptionClasses(speaker.key)}`}
          >
            <input
              type="radio"
              name={`question-${aufgabe.id}`}
              checked={userAnswer === speaker.key}
              onChange={() => onAnswerChange(aufgabe.id, speaker.key)}
              disabled={isSubmitted}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300"
            />
            <span className="ml-3 text-md font-semibold text-slate-700 text-center">
              {speaker.key.toUpperCase()} - {speaker.name}
            </span>
          </label>
        ))}
      </div>
      
      {/* Display explanation when the exam is submitted */}
      {isSubmitted && aufgabe.explanation && (
        <div className="mt-4 text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-200">
          <span className="font-bold text-slate-800">Erklärung:</span> {aufgabe.explanation}
        </div>
      )}
    </div>
  );
};