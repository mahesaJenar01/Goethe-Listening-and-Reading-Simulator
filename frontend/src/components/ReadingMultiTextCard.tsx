import React from 'react';
import { ReadingPart2 } from '../types';
import { MultipleChoiceCard } from './MultipleChoiceCard';

interface ReadingMultiTextCardProps {
  part: ReadingPart2;
  userAnswers: { [key: string]: any };
  isSubmitted: boolean;
  onAnswerChange: (questionId: string, answer: number) => void;
  questionNumberStart: number;
}

export const ReadingMultiTextCard: React.FC<ReadingMultiTextCardProps> = ({ part, userAnswers, isSubmitted, onAnswerChange, questionNumberStart }) => {
  let questionCounter = questionNumberStart;

  return (
    <div className="space-y-10">
      {part.texts.map((textBlock, index) => {
        const currentBlockQuestionCount = questionCounter;
        questionCounter += textBlock.questions.length; // Increment for the next block

        return (
          <div key={index} className="space-y-6">
            {/* Text Article Section */}
            <article className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80">
              <header className="border-b pb-4 mb-6">
                <p className="text-sm font-medium text-sky-600">{textBlock.source}</p>
                <h2 className="text-2xl font-bold text-slate-800 leading-tight mt-2">{textBlock.title}</h2>
              </header>
              <div className="prose max-w-none text-slate-700 leading-relaxed space-y-4">
                {textBlock.content.map((paragraph, pIndex) => (
                  <p key={pIndex}>{paragraph}</p>
                ))}
              </div>
            </article>

            {/* Questions for this Text */}
            <div className="space-y-6">
              {textBlock.questions.map((q, qIndex) => (
                <MultipleChoiceCard
                  key={q.id}
                  aufgabe={q}
                  questionNumber={currentBlockQuestionCount + qIndex}
                  userAnswer={userAnswers[q.id]}
                  isSubmitted={isSubmitted}
                  onAnswerChange={onAnswerChange}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};