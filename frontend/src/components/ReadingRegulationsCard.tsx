// components/ReadingRegulationsCard.tsx

import React from 'react';
import { ReadingPart5 } from '../types';
import { MultipleChoiceCard } from './MultipleChoiceCard';

interface ReadingRegulationsCardProps {
  part: ReadingPart5;
  userAnswers: { [key: string]: any };
  isSubmitted: boolean;
  onAnswerChange: (questionId: string, answer: number) => void;
}

export const ReadingRegulationsCard: React.FC<ReadingRegulationsCardProps> = ({ part, userAnswers, isSubmitted, onAnswerChange }) => {
  // Reading Part 5 questions are numbered 27-30.
  const questionNumberStart = 27;

  return (
    <div className="space-y-8">
      {/* Regulations Text Section */}
      <article className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80">
        <header className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-800 leading-tight">{part.regulations.title}</h1>
        </header>
        <div className="prose max-w-none text-slate-700 leading-relaxed space-y-4">
          {part.regulations.paragraphs.map((p, index) => (
            <div key={index}>
              <h2 className="font-semibold text-slate-800">{p.heading}</h2>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </article>

      {/* Questions Section */}
      <div className="space-y-6">
        {part.questions.map((q, index) => (
          <MultipleChoiceCard
            key={q.id}
            aufgabe={q}
            questionNumber={questionNumberStart + index}
            userAnswer={userAnswers[q.id]}
            isSubmitted={isSubmitted}
            onAnswerChange={onAnswerChange}
          />
        ))}
      </div>
    </div>
  );
};