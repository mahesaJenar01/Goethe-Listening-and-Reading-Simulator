import React, { useReducer, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ExamView from './ExamView';
import ResultsView from './ResultsView';
import { 
    ExamPart, ListeningPart1, ReadingPart2, ReadingPart3, ReadingPart4, 
    MultipleChoiceQuestion, TrueFalseQuestion, ListeningPart4 
} from '../types';
import AllExamsCompleted from './AllExamsCompleted';
import { useExamSessionStorage } from '../hooks/useExamSessionStorage';
import { useFetchExam } from '../hooks/useFetchExam';

export interface ExamState {
    isLoading: boolean;
    error: string | null;
    examParts: ExamPart[];
    allUserAnswers: { [key: string]: any };
    isSubmitted: boolean;
    score: number;
    playedListeningParts: Set<number>;
    audioProgress: { [key: string]: number };
    areAllExamsCompleted: boolean;
    currentPartIndex: number;
    audioStatus: 'loading' | 'ready' | 'error';
    hasPlaybackStarted: boolean;
}

export type ExamAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: ExamPart[] }
  | { type: 'FETCH_ALL_COMPLETED' }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'LOAD_FROM_STORAGE'; payload: Partial<ExamState> }
  | { type: 'ANSWER_QUESTION'; payload: { questionId: string; answer: any } }
  | { type: 'NAVIGATE_PART'; payload: { nextIndex: number, previousIndex: number } }
  | { type: 'SUBMIT_EXAM'; payload: { score: number } }
  | { type: 'UPDATE_AUDIO_PROGRESS'; payload: { src: string; time: number } }
  | { type: 'SET_AUDIO_STATUS'; payload: 'loading' | 'ready' | 'error' }
  | { type: 'SET_HAS_PLAYBACK_STARTED'; payload: boolean };

const examReducer = (state: ExamState, action: ExamAction): ExamState => {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_SUCCESS':
            return { ...state, isLoading: false, examParts: action.payload };
        case 'FETCH_ALL_COMPLETED':
            return { ...state, isLoading: false, areAllExamsCompleted: true };
        case 'FETCH_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        
        case 'LOAD_FROM_STORAGE':
            return { 
                ...state, 
                ...action.payload,
                playedListeningParts: new Set(action.payload.playedListeningParts || []) 
            };

        case 'ANSWER_QUESTION':
            if (state.isSubmitted) return state;
            return {
                ...state,
                allUserAnswers: {
                    ...state.allUserAnswers,
                    [action.payload.questionId]: action.payload.answer,
                },
            };

        case 'NAVIGATE_PART':
            const { nextIndex, previousIndex } = action.payload;
            const newPlayedParts = new Set(state.playedListeningParts);

            if (nextIndex > previousIndex) {
                const partJustLeft = state.examParts[previousIndex];
                if (partJustLeft && partJustLeft.type.startsWith('listening')) {
                    newPlayedParts.add(previousIndex);
                }
            }
            
            return {
                ...state,
                currentPartIndex: nextIndex,
                audioStatus: 'loading',
                hasPlaybackStarted: false,
                playedListeningParts: newPlayedParts
            };

        case 'SUBMIT_EXAM':
            return { ...state, isSubmitted: true, score: action.payload.score };
        
        case 'UPDATE_AUDIO_PROGRESS':
            if (action.payload.time > (state.audioProgress[action.payload.src] || 0)) {
                return {
                    ...state,
                    audioProgress: { ...state.audioProgress, [action.payload.src]: action.payload.time },
                };
            }
            return state;

        case 'SET_AUDIO_STATUS':
            return { ...state, audioStatus: action.payload };

        case 'SET_HAS_PLAYBACK_STARTED':
            return { ...state, hasPlaybackStarted: action.payload };

        default:
            return state;
    }
};

const getUserId = (): string => {
    let userId = localStorage.getItem('examAppUserId');
    if (!userId) {
        userId = String(Math.floor(Math.random() * 1000000) + 1);
        localStorage.setItem('examAppUserId', userId);
    }
    return userId;
};

const ExamSession: React.FC = () => {
    const { examType, partIndex } = useParams<{ examType: 'listening' | 'reading', partIndex: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const initialPartIndex = parseInt(partIndex || '1', 10) - 1;

    const initialState: ExamState = {
        isLoading: false,
        error: null,
        examParts: [],
        allUserAnswers: {},
        isSubmitted: false,
        score: 0,
        playedListeningParts: new Set(),
        audioProgress: {},
        areAllExamsCompleted: false,
        currentPartIndex: initialPartIndex,
        audioStatus: 'loading',
        hasPlaybackStarted: false,
    };
    
    const [state, dispatch] = useReducer(examReducer, initialState);
    const {
        isLoading, error, examParts, allUserAnswers, isSubmitted, score,
        playedListeningParts, audioProgress, areAllExamsCompleted,
        currentPartIndex, audioStatus, hasPlaybackStarted
    } = state;

    const audioRef = useRef<HTMLAudioElement>(null);
    const userId = useMemo(() => getUserId(), []);

    useExamSessionStorage(state, dispatch);
    useFetchExam({ examType, userId, examParts, dispatch });
    
    useEffect(() => {
        const targetPath = `/${examType}/part/${currentPartIndex + 1}`;
        if (location.pathname !== targetPath && !isLoading && examParts.length > 0) {
            navigate(targetPath, { replace: true });
        }
    }, [currentPartIndex, examType, navigate, location.pathname, isLoading, examParts.length]);

    const handleAnswerChange = (questionId: string, answer: any) => {
        dispatch({ type: 'ANSWER_QUESTION', payload: { questionId, answer } });
    };

    const handleNavigation = (nextIndex: number) => {
        window.scrollTo(0, 0);
        if (audioRef.current) {
            audioRef.current.pause();
        }
        dispatch({ type: 'NAVIGATE_PART', payload: { nextIndex, previousIndex: currentPartIndex } });
    };

    const handleNextPart = () => {
        if (currentPartIndex < examParts.length - 1) {
            handleNavigation(currentPartIndex + 1);
        }
    };

    const handlePreviousPart = () => {
        if (currentPartIndex > 0) {
            handleNavigation(currentPartIndex - 1);
        }
    };
    
    const handleRestart = () => {
        localStorage.removeItem('examSession');
        navigate('/');
    };
    
    const handlePlayAudio = () => {
        const audio = audioRef.current;
        const currentPart = examParts[currentPartIndex];
        
        if (audio && currentPart && 'audioSrc' in currentPart) {
            const audioSrc = currentPart.audioSrc as string;
            const savedTime = audioProgress[audioSrc] || 0;
            const resumeTime = Math.max(0, savedTime - 5);
            
            audio.currentTime = resumeTime;
            audio.play();
            dispatch({ type: 'SET_HAS_PLAYBACK_STARTED', payload: true });
        }
    };

    const handleAudioTimeUpdate = () => {
        const audio = audioRef.current;
        if (!audio || !examParts[currentPartIndex]) return;
        const currentPart = examParts[currentPartIndex];
        if ('audioSrc' in currentPart) {
            dispatch({ type: 'UPDATE_AUDIO_PROGRESS', payload: { src: currentPart.audioSrc as string, time: audio.currentTime } });
        }
    };

    // --- THIS IS THE FIX ---
    const handleSubmit = async () => {
        // 1. Calculate the final score
        let currentScore = 0;
        examParts.forEach(part => {
             switch (part.type) {
                case 'listening-part-1':
                    (part as ListeningPart1).textBlocks.forEach(block => {
                        const [tf, mc] = block.questions;
                        if (allUserAnswers[tf.id] === tf.correctAnswer) currentScore++;
                        if (allUserAnswers[mc.id] === (mc as MultipleChoiceQuestion).correctAnswerIndex) currentScore++;
                    });
                    break;
                case 'listening-part-2':
                case 'reading-part-5':
                    (part as { questions: MultipleChoiceQuestion[] }).questions.forEach(q => {
                        if (allUserAnswers[q.id] === q.correctAnswerIndex) currentScore++;
                    });
                    break;
                case 'listening-part-3':
                case 'reading-part-1':
                     (part as { questions: TrueFalseQuestion[] }).questions.forEach(q => {
                         if (allUserAnswers[q.id] === q.correctAnswer) currentScore++;
                     });
                     break;
                case 'listening-part-4':
                    (part as ListeningPart4).questions.forEach(q => {
                         if (allUserAnswers[q.id] === q.correctAnswer) currentScore++;
                    });
                    break;
                case 'reading-part-2':
                    (part as ReadingPart2).texts.forEach(text => text.questions.forEach(q => {
                        if (allUserAnswers[q.id] === q.correctAnswerIndex) currentScore++;
                    }));
                    break;
                case 'reading-part-3':
                    (part as ReadingPart3).situations.forEach(sit => {
                        if (allUserAnswers[sit.id] === sit.correctAnswer) currentScore++;
                    });
                    break;
                case 'reading-part-4':
                    (part as ReadingPart4).opinions.forEach(op => {
                        if (allUserAnswers[op.id] === op.correctAnswer) currentScore++;
                    });
                    break;
            }
        });

        // 2. Prepare the data payload for the API with detailed question results
        const performanceData = {
            userId: userId,
            examType: examType,
            totalScore: currentScore,
            totalQuestions: totalQuestions,
            parts: examParts.map(part => {
                const questionsPerformance: any[] = [];
                
                switch (part.type) {
                    case 'listening-part-1':
                        (part as ListeningPart1).textBlocks.forEach(block => {
                            const [tf, mc] = block.questions;
                            questionsPerformance.push({
                                questionId: tf.id,
                                userAnswer: allUserAnswers[tf.id],
                                correctAnswer: tf.correctAnswer,
                                isCorrect: allUserAnswers[tf.id] === tf.correctAnswer
                            });
                            questionsPerformance.push({
                                questionId: mc.id,
                                userAnswer: allUserAnswers[mc.id],
                                correctAnswer: (mc as MultipleChoiceQuestion).correctAnswerIndex,
                                isCorrect: allUserAnswers[mc.id] === (mc as MultipleChoiceQuestion).correctAnswerIndex
                            });
                        });
                        break;
                    case 'listening-part-2':
                    case 'reading-part-5':
                        (part as { questions: MultipleChoiceQuestion[] }).questions.forEach(q => {
                            questionsPerformance.push({
                                questionId: q.id,
                                userAnswer: allUserAnswers[q.id],
                                correctAnswer: q.correctAnswerIndex,
                                isCorrect: allUserAnswers[q.id] === q.correctAnswerIndex
                            });
                        });
                        break;
                    case 'listening-part-3':
                    case 'reading-part-1':
                        (part as { questions: TrueFalseQuestion[] }).questions.forEach(q => {
                            questionsPerformance.push({
                                questionId: q.id,
                                userAnswer: allUserAnswers[q.id],
                                correctAnswer: q.correctAnswer,
                                isCorrect: allUserAnswers[q.id] === q.correctAnswer
                            });
                        });
                        break;
                    case 'listening-part-4':
                        (part as ListeningPart4).questions.forEach(q => {
                            questionsPerformance.push({
                                questionId: q.id,
                                userAnswer: allUserAnswers[q.id],
                                correctAnswer: q.correctAnswer,
                                isCorrect: allUserAnswers[q.id] === q.correctAnswer
                            });
                        });
                        break;
                    case 'reading-part-2':
                        (part as ReadingPart2).texts.forEach(text => text.questions.forEach(q => {
                            questionsPerformance.push({
                                questionId: q.id,
                                userAnswer: allUserAnswers[q.id],
                                correctAnswer: q.correctAnswerIndex,
                                isCorrect: allUserAnswers[q.id] === q.correctAnswerIndex
                            });
                        }));
                        break;
                    case 'reading-part-3':
                        (part as ReadingPart3).situations.forEach(sit => {
                            questionsPerformance.push({
                                questionId: sit.id,
                                userAnswer: allUserAnswers[sit.id],
                                correctAnswer: sit.correctAnswer,
                                isCorrect: allUserAnswers[sit.id] === sit.correctAnswer
                            });
                        });
                        break;
                    case 'reading-part-4':
                        (part as ReadingPart4).opinions.forEach(op => {
                            questionsPerformance.push({
                                questionId: op.id,
                                userAnswer: allUserAnswers[op.id],
                                correctAnswer: op.correctAnswer,
                                isCorrect: allUserAnswers[op.id] === op.correctAnswer
                            });
                        });
                        break;
                }
                
                return {
                    partId: part.id,
                    questions: questionsPerformance
                };
            })
        };
        
        // 3. Call the API to save the performance data
        try {
            const response = await fetch('http://127.0.0.1:5000/api/save-exam', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(performanceData),
            });
            if (!response.ok) {
                // Log an error if saving fails, but don't block the user
                console.error("Failed to save exam performance:", response.statusText);
            }
        } catch (error) {
            console.error("Error saving exam performance:", error);
        }

        // 4. Update local state to show the results view
        dispatch({ type: 'SUBMIT_EXAM', payload: { score: currentScore } });
        window.scrollTo(0, 0);
        localStorage.removeItem('examSession'); // Clean up the session storage
    };
    // --- END OF FIX ---

    const getPartQuestionCount = (part: ExamPart): number => {
        switch (part.type) {
            case 'listening-part-1': return (part as ListeningPart1).textBlocks.length * 2;
            case 'reading-part-2': return (part as ReadingPart2).texts.reduce((acc, text) => acc + text.questions.length, 0);
            case 'reading-part-3': return (part as ReadingPart3).situations.length;
            case 'reading-part-4': return (part as ReadingPart4).opinions.length;
            default: return part.questions.length;
        }
    };

    const totalQuestions = useMemo(() => {
        if (examParts.length === 0) return 0;
        return examParts.reduce((acc, part) => acc + getPartQuestionCount(part), 0);
    }, [examParts]);

    const areCurrentPartQuestionsAnswered = useMemo(() => {
        if (!examParts[currentPartIndex]) return false;
        const currentPart = examParts[currentPartIndex];
        let questionsToCheck: { id: string }[] = [];
        
        switch (currentPart.type) {
            case 'listening-part-1':
                questionsToCheck = (currentPart as ListeningPart1).textBlocks.flatMap(block => block.questions);
                break;
            case 'reading-part-2':
                 questionsToCheck = (currentPart as ReadingPart2).texts.flatMap(text => text.questions);
                 break;
            case 'reading-part-3':
                 questionsToCheck = (currentPart as ReadingPart3).situations;
                 break;
            case 'reading-part-4':
                 questionsToCheck = (currentPart as ReadingPart4).opinions;
                 break;
            default:
                 questionsToCheck = currentPart.questions || [];
                 break;
        }
        return questionsToCheck.every(q => allUserAnswers[q.id] !== undefined && allUserAnswers[q.id] !== '');
    }, [currentPartIndex, allUserAnswers, examParts]);

    // Render logic remains the same
    if (isLoading) return <p className="text-center text-slate-600">Prüfung wird geladen...</p>;
    if (error) return <p className="text-center text-red-600 font-semibold">{error}</p>;
    if (areAllExamsCompleted) {
        return <AllExamsCompleted examType={examType} />;
    }
    if (isSubmitted) {
        return <ResultsView score={score} totalQuestions={totalQuestions} onRestart={handleRestart} examParts={examParts} allUserAnswers={allUserAnswers} getPartQuestionCount={getPartQuestionCount} />;
    }
    if (examParts.length === 0 || !examParts[currentPartIndex]) {
        return <p className="text-center text-slate-600">Prüfung wird vorbereitet...</p>;
    }

    return (
        <ExamView
            examType={examType!}
            currentPart={examParts[currentPartIndex]}
            currentPartIndex={currentPartIndex}
            isLastPart={currentPartIndex === examParts.length - 1}
            areCurrentPartQuestionsAnswered={areCurrentPartQuestionsAnswered}
            allUserAnswers={allUserAnswers}
            handleAnswerChange={handleAnswerChange}
            handleNextPart={handleNextPart}
            handleSubmit={handleSubmit}
            handlePreviousPart={handlePreviousPart}
            playedListeningParts={playedListeningParts}
            getPartQuestionCount={getPartQuestionCount}
            examParts={examParts}
            audioRef={audioRef}
            audioStatus={audioStatus}
            setAudioStatus={(status) => dispatch({ type: 'SET_AUDIO_STATUS', payload: status })}
            handlePlayAudio={handlePlayAudio}
            handleAudioTimeUpdate={handleAudioTimeUpdate}
            hasPlaybackStarted={hasPlaybackStarted}
        />
    );
};

export default ExamSession;