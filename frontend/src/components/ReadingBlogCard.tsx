// components/ReadingBlogCard.tsx

import React from 'react';
import { ReadingPart1 } from '../types';
import { TrueFalseCard } from './TrueFalseCard';

interface ReadingBlogCardProps {
  part: ReadingPart1;
  userAnswers: { [key: string]: any };
  isSubmitted: boolean;
  onAnswerChange: (questionId: string, answer: boolean) => void;
}

export const ReadingBlogCard: React.FC<ReadingBlogCardProps> = ({ part, userAnswers, isSubmitted, onAnswerChange }) => {
  return (
    <div className="space-y-8">
      {/* Blog Post Section */}
      <article className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80">
        <header className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 leading-tight">{part.blog.title}</h1>
          <p className="text-sm text-slate-500 mt-2">
            Gepostet von <span className="font-semibold text-slate-600">{part.blog.author}</span> am {part.blog.date}
          </p>
        </header>
        <div className="prose max-w-none text-slate-700 leading-relaxed space-y-4">
          {part.blog.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      {/* Questions Section */}
      <div className="space-y-6">
        {/* Example Question: Rendered in a read-only state */}
        {!isSubmitted && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 opacity-90">
                <p className="text-sm font-medium text-sky-600">Beispiel</p>
                <p className="text-lg font-semibold text-slate-800 mt-2">{part.example.statement}</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`flex items-center justify-center p-3 rounded-lg border-2 ${part.example.correctAnswer ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}>
                        <input type="radio" checked={part.example.correctAnswer} disabled className="h-4 w-4 text-sky-600"/>
                        <span className="ml-3 text-md font-semibold text-slate-700">Richtig</span>
                    </div>
                    <div className={`flex items-center justify-center p-3 rounded-lg border-2 ${!part.example.correctAnswer ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}>
                        <input type="radio" checked={!part.example.correctAnswer} disabled className="h-4 w-4 text-sky-600"/>
                        <span className="ml-3 text-md font-semibold text-slate-700">Falsch</span>
                    </div>
                </div>
            </div>
        )}

        {/* Render the actual questions using the existing TrueFalseCard */}
        {part.questions.map((q, index) => (
          <TrueFalseCard
            key={q.id}
            aufgabe={q}
            questionNumber={index + 1}
            userAnswer={userAnswers[q.id]}
            isSubmitted={isSubmitted}
            onAnswerChange={onAnswerChange}
          />
        ))}
      </div>
    </div>
  );
};