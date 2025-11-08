import React from 'react';
import Results from './Results';
import { 
    ExamPart, 
    ListeningPart1, 
    ListeningPart4, 
    ReadingPart1, 
    ReadingPart2, 
    ReadingPart3, 
    ReadingPart4, 
    ReadingPart5, 
    MultipleChoiceQuestion, 
    SpeakerAssignmentQuestion 
} from '../types';
import { MultipleChoiceCard } from './MultipleChoiceCard';
import { TrueFalseCard } from './TrueFalseCard';
import { SpeakerAssignmentCard } from './SpeakerAssignmentCard';
import { ReadingBlogCard } from './ReadingBlogCard';
import { ReadingMultiTextCard } from './ReadingMultiTextCard';
import { ReadingAssignmentCard } from './ReadingAssignmentCard';
import { ReadingYesNoCard } from './ReadingYesNoCard';
import { ReadingRegulationsCard } from './ReadingRegulationsCard';

interface ResultsViewProps {
    score: number;
    totalQuestions: number;
    onRestart: () => void;
    examParts: ExamPart[];
    allUserAnswers: { [key: string]: any };
    getPartQuestionCount: (part: ExamPart) => number;
    timeTaken: number | null; // NEW: Time taken prop
}

const ResultsView: React.FC<ResultsViewProps> = ({
    score,
    totalQuestions,
    onRestart,
    examParts,
    allUserAnswers,
    getPartQuestionCount,
    timeTaken, // NEW
}) => {
    
    // --- NEW: Helper to format time ---
    const formatTime = (totalSeconds: number | null) => {
        if (totalSeconds === null) return null;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes} Minuten und ${seconds} Sekunden`;
    };

    const renderResultsForPart = (part: ExamPart, partIndex: number) => {
        let questionCounter = 1;
        for (let i = 0; i < partIndex; i++) {
            questionCounter += getPartQuestionCount(examParts[i]);
        }

        switch (part.type) {
            case 'listening-part-1':
                return (part as ListeningPart1).textBlocks.map((block, blockIndex) => {
                    const baseQNum = questionCounter + (blockIndex * 2);
                    const [tf, mc] = block.questions;
                    return (
                        <div key={tf.id} className="space-y-4 p-4 bg-white rounded-xl border border-slate-200">
                             <p className="italic text-slate-600 text-sm">{block.context}</p>
                             <TrueFalseCard aufgabe={tf} questionNumber={baseQNum} userAnswer={allUserAnswers[tf.id]} isSubmitted={true} onAnswerChange={() => {}} />
                             <MultipleChoiceCard aufgabe={mc} questionNumber={baseQNum + 1} userAnswer={allUserAnswers[mc.id]} isSubmitted={true} onAnswerChange={() => {}} />
                        </div>
                    )
                });
            case 'listening-part-2':
                 return part.questions.map((q, index) => <MultipleChoiceCard key={q.id} aufgabe={q as MultipleChoiceQuestion} questionNumber={questionCounter + index} userAnswer={allUserAnswers[q.id]} isSubmitted={true} onAnswerChange={() => {}} />);
            case 'listening-part-3':
                 return part.questions.map((q, index) => <TrueFalseCard key={q.id} aufgabe={q} questionNumber={questionCounter + index} userAnswer={allUserAnswers[q.id]} isSubmitted={true} onAnswerChange={() => {}} />);
            case 'listening-part-4':
                const p4 = part as ListeningPart4;
                return p4.questions.map((q, index) => (
                    <SpeakerAssignmentCard key={q.id} aufgabe={q as SpeakerAssignmentQuestion} speakers={p4.speakers} questionNumber={questionCounter + index} userAnswer={allUserAnswers[q.id]} isSubmitted={true} onAnswerChange={() => {}} />
                ));
            case 'reading-part-1':
                 return <ReadingBlogCard part={part as ReadingPart1} userAnswers={allUserAnswers} isSubmitted={true} onAnswerChange={() => {}} />;
            case 'reading-part-2':
                return <ReadingMultiTextCard part={part as ReadingPart2} userAnswers={allUserAnswers} isSubmitted={true} onAnswerChange={() => {}} questionNumberStart={questionCounter} />;
            case 'reading-part-3':
                return <ReadingAssignmentCard part={part as ReadingPart3} userAnswers={allUserAnswers} isSubmitted={true} onAnswerChange={() => {}} />;
            case 'reading-part-4':
                return <ReadingYesNoCard part={part as ReadingPart4} userAnswers={allUserAnswers} isSubmitted={true} onAnswerChange={() => {}} />;
            case 'reading-part-5':
                return <ReadingRegulationsCard part={part as ReadingPart5} userAnswers={allUserAnswers} isSubmitted={true} onAnswerChange={() => {}} />;
            default: 
                return <p>Auswertung für diesen Aufgabentyp nicht verfügbar.</p>;
        }
    }

    return (
        <>
            <Results score={score} total={totalQuestions} onRestart={onRestart} />

            {/* --- NEW: Display time taken --- */}
            {timeTaken !== null && (
                <div className="mt-6 text-center text-slate-600 font-medium">
                    Benötigte Zeit: {formatTime(timeTaken)}
                </div>
            )}
            
            <div className="mt-12">
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">Detaillierte Auswertung</h2>
                {examParts.map((part, index) => (
                    <div key={part.id} className="mb-8">
                        <div className="bg-white p-4 rounded-t-xl border-b-2 border-slate-200">
                           <h3 className="text-xl font-bold text-slate-700">Teil {index + 1}</h3>
                           <p className="text-sm text-slate-500 mt-1">{part.instruction}</p>
                        </div>
                        <div className="space-y-6 bg-slate-50 p-4 rounded-b-xl">
                            {renderResultsForPart(part, index)}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ResultsView;