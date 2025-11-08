import React from 'react';
import { 
    ExamPart, 
    ListeningPart1, 
    ListeningPart4, 
    MultipleChoiceQuestion, 
    SpeakerAssignmentQuestion, 
    ReadingPart1, 
    ReadingPart2, 
    ReadingPart3, 
    ReadingPart4, 
    ReadingPart5 
} from '../types';
import { MultipleChoiceCard } from './MultipleChoiceCard';
import { TrueFalseCard } from './TrueFalseCard';
import { SpeakerAssignmentCard } from './SpeakerAssignmentCard';
import { ReadingBlogCard } from './ReadingBlogCard';
import { ReadingMultiTextCard } from './ReadingMultiTextCard';
import { ReadingAssignmentCard } from './ReadingAssignmentCard';
import { ReadingYesNoCard } from './ReadingYesNoCard';
import { ReadingRegulationsCard } from './ReadingRegulationsCard';
import Timer from './Timer'; // NEW: Import Timer

interface ExamViewProps {
    examType: 'listening' | 'reading';
    currentPart: ExamPart;
    currentPartIndex: number;
    isLastPart: boolean;
    areCurrentPartQuestionsAnswered: boolean;
    allUserAnswers: { [key: string]: any };
    handleAnswerChange: (questionId: string, answer: any) => void;
    handleNextPart: () => void;
    handleSubmit: () => void;
    handlePreviousPart: () => void;
    playedListeningParts: Set<number>;
    getPartQuestionCount: (part: ExamPart) => number;
    examParts: ExamPart[];
    audioRef: React.RefObject<HTMLAudioElement>;
    audioStatus: 'loading' | 'ready' | 'error';
    setAudioStatus: (status: 'loading' | 'ready' | 'error') => void;
    handlePlayAudio: () => void;
    handleAudioTimeUpdate: () => void;
    hasPlaybackStarted: boolean;
    timeLeft: number; // NEW: timeLeft prop
}

const PART_COMPONENTS: { [key: string]: React.ComponentType<any> } = {
    'reading-part-1': ReadingBlogCard,
    'reading-part-2': ReadingMultiTextCard,
    'reading-part-3': ReadingAssignmentCard,
    'reading-part-4': ReadingYesNoCard,
    'reading-part-5': ReadingRegulationsCard,
};

const ExamView: React.FC<ExamViewProps> = ({
    examType,
    currentPart,
    currentPartIndex,
    isLastPart,
    areCurrentPartQuestionsAnswered,
    allUserAnswers,
    handleAnswerChange,
    handleNextPart,
    handleSubmit,
    handlePreviousPart,
    playedListeningParts,
    getPartQuestionCount,
    examParts,
    audioRef,
    audioStatus,
    setAudioStatus,
    handlePlayAudio,
    handleAudioTimeUpdate,
    hasPlaybackStarted,
    timeLeft, // NEW
}) => {

    const renderExample = () => {
        if (examType !== 'listening') return null;
    
        switch (currentPart.type) {
            case 'listening-part-1': {
                const p1 = currentPart as ListeningPart1;
                const p1Example = p1.example;
                if (!p1Example) return null;
                const [tfQuestion, mcQuestion] = p1Example.questions;
                const optionLabels = ['a', 'b', 'c'];
    
                return (
                    <div className="mb-6 bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 opacity-95">
                        <p className="text-sm font-medium text-sky-600">Beispiel</p>
                        
                        <div className="mt-2 p-3 bg-slate-100 rounded-md text-slate-700">{p1Example.preReadInstruction}</div>
                        <p className="mt-3 text-slate-600 italic">{p1Example.context}</p>
    
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-lg font-semibold text-slate-800 mt-2">{tfQuestion.statement}</p>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className={`flex items-center justify-center p-3 rounded-lg border-2 ${tfQuestion.correctAnswer ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}>
                                    <input type="radio" checked={tfQuestion.correctAnswer} disabled className="h-4 w-4 text-sky-600"/>
                                    <span className="ml-3 text-md font-semibold text-slate-700">Richtig</span>
                                </div>
                                <div className={`flex items-center justify-center p-3 rounded-lg border-2 ${!tfQuestion.correctAnswer ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}>
                                    <input type="radio" checked={!tfQuestion.correctAnswer} disabled className="h-4 w-4 text-sky-600"/>
                                    <span className="ml-3 text-md font-semibold text-slate-700">Falsch</span>
                                </div>
                            </div>
                        </div>
    
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-lg font-semibold text-slate-800 mt-2">{mcQuestion.question}</p>
                            <div className="mt-4 space-y-3">
                                {mcQuestion.options.map((option, index) => (
                                    <div key={index} className={`flex items-center p-3 rounded-lg border-2 ${index === mcQuestion.correctAnswerIndex ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}>
                                        <input type="radio" checked={index === mcQuestion.correctAnswerIndex} disabled className="h-4 w-4 text-sky-600" />
                                        <span className="ml-4 text-md text-slate-700">
                                            <span className="font-bold">{optionLabels[index]})</span> {option}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }
            case 'listening-part-4': {
                const p4 = currentPart as ListeningPart4;
                const p4Example = p4.example;
                if (!p4Example) return null;
    
                return (
                    <div className="mb-6 bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 opacity-95">
                        <p className="text-sm font-medium text-sky-600">Beispiel</p>
                        <p className="text-lg font-semibold text-slate-800 mt-2">{p4Example.statement}</p>
                        
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {p4.speakers.map((speaker) => (
                              <div key={speaker.key} className={`flex items-center justify-center p-3 rounded-lg border-2 ${speaker.key === p4Example.correctAnswer ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}>
                                <input type="radio" checked={speaker.key === p4Example.correctAnswer} disabled className="h-4 w-4 text-sky-600" />
                                <span className="ml-3 text-md font-semibold text-slate-700 text-center">
                                  {speaker.key.toUpperCase()} - {speaker.name}
                                </span>
                              </div>
                            ))}
                        </div>
                    </div>
                );
            }
            default:
                return null;
        }
    };

    const renderCurrentPart = () => {
        let questionCounter = 1;
        for (let i = 0; i < currentPartIndex; i++) {
             questionCounter += getPartQuestionCount(examParts[i]);
        }

        const PartComponent = PART_COMPONENTS[currentPart.type];
        if (PartComponent) {
            return (
                <PartComponent 
                    part={currentPart}
                    userAnswers={allUserAnswers}
                    isSubmitted={false}
                    onAnswerChange={handleAnswerChange}
                    questionNumberStart={questionCounter}
                />
            );
        }

        switch (currentPart.type) {
            case 'listening-part-1':
                return (currentPart as ListeningPart1).textBlocks.map((block, blockIndex) => {
                    const baseQNum = questionCounter + (blockIndex * 2);
                    const [tfQuestion, mcQuestion] = block.questions;
                    return (
                        <React.Fragment key={block.questions[0].id}>
                            <div className="p-4 bg-slate-100/80 rounded-lg text-slate-600 font-medium">{block.preReadInstruction}</div>
                            <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-200/80 space-y-6">
                                <p className="italic text-slate-600">{block.context}</p>
                                <TrueFalseCard aufgabe={tfQuestion} questionNumber={baseQNum} userAnswer={allUserAnswers[tfQuestion.id]} isSubmitted={false} onAnswerChange={handleAnswerChange} />
                                <MultipleChoiceCard aufgabe={mcQuestion} questionNumber={baseQNum + 1} userAnswer={allUserAnswers[mcQuestion.id]} isSubmitted={false} onAnswerChange={handleAnswerChange} />
                            </div>
                        </React.Fragment>
                    );
                });
            case 'listening-part-2':
                return currentPart.questions.map((q, index) => <MultipleChoiceCard key={q.id} aufgabe={q as MultipleChoiceQuestion} questionNumber={questionCounter + index} userAnswer={allUserAnswers[q.id]} isSubmitted={false} onAnswerChange={handleAnswerChange} />);
            case 'listening-part-3':
                return currentPart.questions.map((q, index) => <TrueFalseCard key={q.id} aufgabe={q} questionNumber={questionCounter + index} userAnswer={allUserAnswers[q.id]} isSubmitted={false} onAnswerChange={handleAnswerChange} />);
            case 'listening-part-4':
                const p4 = currentPart as ListeningPart4;
                return p4.questions.map((q, index) => (
                    <SpeakerAssignmentCard key={q.id} aufgabe={q as SpeakerAssignmentQuestion} speakers={p4.speakers} questionNumber={questionCounter + index} userAnswer={allUserAnswers[q.id]} isSubmitted={false} onAnswerChange={handleAnswerChange} />
                ));
            default: return <p>Unbekannter Aufgabentyp</p>;
        }
    };

    return (
         <>
            <div className="mb-6 bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
                {/* --- NEW: Timer display added here --- */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">Teil {currentPartIndex + 1}</h2>
                    <Timer timeLeft={timeLeft} />
                </div>
                <p className="mt-2 text-slate-600">{currentPart.instruction}</p>
                
                { 'workingTime' in currentPart && (
                    <p className="mt-2 text-sm text-slate-500 font-medium">Arbeitszeit: {currentPart.workingTime}</p>
                )}

                { examType === 'listening' && 'audioSrc' in currentPart && (
                    <div className="mt-4 flex items-center space-x-4">
                        <button 
                            onClick={handlePlayAudio} 
                            disabled={
                                audioStatus !== 'ready' || 
                                playedListeningParts.has(currentPartIndex) ||
                                hasPlaybackStarted
                            } 
                            className="flex-shrink-0 p-3 rounded-full shadow-md transition-all duration-300 bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.838l3.423-1.994a1 1 0 000-1.676l-3.423-1.994z" /></svg>
                        </button>
                        <audio 
                            ref={audioRef} 
                            src={(currentPart as any).audioSrc} 
                            onCanPlay={() => setAudioStatus('ready')} 
                            onError={() => setAudioStatus('error')} 
                            onTimeUpdate={handleAudioTimeUpdate}
                        />
                        <p className="text-md text-slate-500">{audioStatus === 'loading' ? 'Audio wird geladen...' : audioStatus === 'ready' ? (playedListeningParts.has(currentPartIndex) ? 'Audio kann nicht wiederholt werden.' : 'Hörtext bereit.') : 'Fehler beim Laden des Audios.'}</p>
                    </div>
                )}
            </div>

            {renderExample()}

            <div className="space-y-6"> {renderCurrentPart()} </div>

            <div className="mt-8 flex justify-between items-center">
                <button
                    onClick={handlePreviousPart}
                    disabled={currentPartIndex === 0}
                    className="px-6 py-3 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 bg-slate-200 text-slate-700 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    Vorheriger Teil
                </button>

                {isLastPart ? (
                    <button onClick={handleSubmit} disabled={!areCurrentPartQuestionsAnswered} className="px-8 py-3 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
                        Prüfung abschicken
                    </button>
                ) : (
                    <button onClick={handleNextPart} disabled={!areCurrentPartQuestionsAnswered} className="px-8 py-3 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
                        Nächster Teil
                    </button>
                )}
            </div>
        </>
    );
};

export default ExamView;