import React from 'react';
import { ExamPart, ListeningPart1, ListeningPart4 } from '../types';
import { MultipleChoiceCard } from './MultipleChoiceCard';
import { TrueFalseCard } from './TrueFalseCard';
import { SpeakerAssignmentCard } from './SpeakerAssignmentCard';
import { ReadingBlogCard } from './ReadingBlogCard';
import { ReadingMultiTextCard } from './ReadingMultiTextCard';
import { ReadingAssignmentCard } from './ReadingAssignmentCard';
import { ReadingYesNoCard } from './ReadingYesNoCard';
import { ReadingRegulationsCard } from './ReadingRegulationsCard';
import ExamPartHeader from './ExamPartHeader';
import ExamControls from './ExamControls';

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
    timeLeft: number;
}

// A more comprehensive component map for rendering parts
const PART_COMPONENTS: { [key: string]: React.ComponentType<any> } = {
    'reading-part-1': ReadingBlogCard,
    'reading-part-2': ReadingMultiTextCard,
    'reading-part-3': ReadingAssignmentCard,
    'reading-part-4': ReadingYesNoCard,
    'reading-part-5': ReadingRegulationsCard,
};

const ExamView: React.FC<ExamViewProps> = ({ examType, currentPart, currentPartIndex, ...props }) => {

    const renderCurrentPart = () => {
        let questionCounter = 1;
        for (let i = 0; i < currentPartIndex; i++) {
             questionCounter += props.getPartQuestionCount(props.examParts[i]);
        }

        const PartComponent = PART_COMPONENTS[currentPart.type];
        if (PartComponent) {
            return (
                <PartComponent 
                    part={currentPart}
                    userAnswers={props.allUserAnswers}
                    isSubmitted={false}
                    onAnswerChange={props.handleAnswerChange}
                    questionNumberStart={questionCounter} // Pass start number for flexible numbering
                />
            );
        }

        // Handle listening parts which have a more complex structure
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
                                <TrueFalseCard aufgabe={tfQuestion} questionNumber={baseQNum} userAnswer={props.allUserAnswers[tfQuestion.id]} isSubmitted={false} onAnswerChange={props.handleAnswerChange} />
                                <MultipleChoiceCard aufgabe={mcQuestion} questionNumber={baseQNum + 1} userAnswer={props.allUserAnswers[mcQuestion.id]} isSubmitted={false} onAnswerChange={props.handleAnswerChange} />
                            </div>
                        </React.Fragment>
                    );
                });
            case 'listening-part-2':
                return currentPart.questions.map((q, index) => <MultipleChoiceCard key={q.id} aufgabe={q} questionNumber={questionCounter + index} userAnswer={props.allUserAnswers[q.id]} isSubmitted={false} onAnswerChange={props.handleAnswerChange} />);
            case 'listening-part-3':
                return currentPart.questions.map((q, index) => <TrueFalseCard key={q.id} aufgabe={q} questionNumber={questionCounter + index} userAnswer={props.allUserAnswers[q.id]} isSubmitted={false} onAnswerChange={props.handleAnswerChange} />);
            case 'listening-part-4':
                const p4 = currentPart as ListeningPart4;
                return p4.questions.map((q, index) => (
                    <SpeakerAssignmentCard key={q.id} aufgabe={q} speakers={p4.speakers} questionNumber={questionCounter + index} userAnswer={props.allUserAnswers[q.id]} isSubmitted={false} onAnswerChange={props.handleAnswerChange} />
                ));
            default: return <p>Unbekannter Aufgabentyp</p>;
        }
    };

    return (
         <>
            <ExamPartHeader
                currentPart={currentPart}
                currentPartIndex={currentPartIndex}
                timeLeft={props.timeLeft}
                examType={examType}
                audioRef={props.audioRef}
                audioStatus={props.audioStatus}
                playedListeningParts={props.playedListeningParts}
                hasPlaybackStarted={props.hasPlaybackStarted}
                onPlayAudio={props.handlePlayAudio}
                onAudioTimeUpdate={props.handleAudioTimeUpdate}
                onSetAudioStatus={props.setAudioStatus}
            />

            <div className="space-y-6"> {renderCurrentPart()} </div>

            <ExamControls
                isLastPart={props.isLastPart}
                areCurrentPartQuestionsAnswered={props.areCurrentPartQuestionsAnswered}
                currentPartIndex={currentPartIndex}
                onPreviousPart={props.handlePreviousPart}
                onNextPart={props.handleNextPart}
                onSubmit={props.handleSubmit}
            />
        </>
    );
};

export default ExamView;