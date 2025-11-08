import React, { useReducer, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// UI Components
import ExamView from './ExamView';
import ResultsView from './ResultsView';
import AllExamsCompleted from './AllExamsCompleted';

// Types and State Management
import { ExamPart, ListeningPart1, ReadingPart2, ReadingPart3, ReadingPart4 } from '../types';
import { examReducer, ExamState } from '../state/examState';

// Custom Hooks
import { useExamSessionStorage } from '../hooks/useExamSessionStorage';
import { useFetchExam } from '../hooks/useFetchExam';
import { useExamTimer } from '../hooks/useExamTimer';
import { useAuth } from '../contexts/AuthContext';

// Utilities
import { calculateScore } from '../utils/scoreCalculator';
import { formatPerformanceData } from '../utils/performanceDataFormatter';

// --- Constants ---
const EXAM_DURATIONS = {
    listening: 40 * 60, // 40 minutes
    reading: 65 * 60,   // 65 minutes
};
const API_BASE_URL = 'http://127.0.0.1:5000';

// --- Component ---
const ExamSession: React.FC = () => {
    const { examType, partIndex } = useParams<{ examType: 'listening' | 'reading', partIndex: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = useAuth();

    const initialPartIndex = parseInt(partIndex || '1', 10) - 1;
    const totalExamTime = examType ? EXAM_DURATIONS[examType] : 0;

    const initialState: ExamState = {
        isLoading: true,
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
        timeLeft: totalExamTime,
        examStartTime: null,
        timeTaken: null,
    };
    
    const [state, dispatch] = useReducer(examReducer, initialState);
    const {
        isLoading, error, examParts, allUserAnswers, isSubmitted, score,
        playedListeningParts, audioProgress, areAllExamsCompleted,
        currentPartIndex, audioStatus, hasPlaybackStarted, timeLeft, timeTaken
    } = state;

    const audioRef = useRef<HTMLAudioElement>(null);
    
    useFetchExam({ examType, userId: userId!, examParts: state.examParts, dispatch, totalExamTime });
    useExamSessionStorage(state, dispatch, examType);

    const handleSubmit = useCallback(async () => {
        // ... (handleSubmit logic remains exactly the same)
        if (isSubmitted) return;

        const totalQuestions = examParts.reduce((acc, part) => acc + getPartQuestionCount(part), 0);
        const finalScore = calculateScore(examParts, allUserAnswers);
        const finalTimeTaken = totalExamTime - timeLeft;
        
        const performanceData = formatPerformanceData({
            userId,
            examType,
            totalScore: finalScore,
            totalQuestions,
            timeTakenInSeconds: finalTimeTaken,
            examParts,
            allUserAnswers
        });

        try {
            const response = await fetch(`${API_BASE_URL}/api/save-exam`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(performanceData),
            });
             if (!response.ok) {
                console.error("Failed to save exam performance:", response.statusText);
            }
        } catch (apiError) {
            console.error("Error saving exam performance:", apiError);
        }

        dispatch({ type: 'SUBMIT_EXAM', payload: { score: finalScore, timeTaken: finalTimeTaken } });
        window.scrollTo(0, 0);
        localStorage.removeItem('examSession');
    }, [isSubmitted, examParts, allUserAnswers, totalExamTime, timeLeft, userId, examType]);

    // --- FIX: Stabilize the onTick callback ---
    const onTick = useCallback(() => {
        dispatch({ type: 'TIMER_TICK' });
    }, []); // The dispatch function from useReducer is stable and doesn't need to be a dependency.

    useExamTimer({
        isTimerActive: examParts.length > 0 && !isSubmitted,
        timeLeft: timeLeft,
        onTick: onTick, // Pass the stabilized function
        onTimeUp: handleSubmit,
    });
    
    useEffect(() => {
        const targetPath = `/${examType}/part/${currentPartIndex + 1}`;
        if (location.pathname !== targetPath && !isLoading && examParts.length > 0) {
            navigate(targetPath, { replace: true });
        }
    }, [currentPartIndex, examType, navigate, location.pathname, isLoading, examParts.length]);

    // ... (All other handlers and memos remain exactly the same)
    const handleAnswerChange = (questionId: string, answer: any) => {
        dispatch({ type: 'ANSWER_QUESTION', payload: { questionId, answer } });
    };

    const handleNavigation = (nextIndex: number) => {
        window.scrollTo(0, 0);
        audioRef.current?.pause();
        dispatch({ type: 'NAVIGATE_PART', payload: { nextIndex, previousIndex: currentPartIndex } });
    };

    const handleNextPart = () => {
        if (currentPartIndex < examParts.length - 1) handleNavigation(currentPartIndex + 1);
    };

    const handlePreviousPart = () => {
        if (currentPartIndex > 0) handleNavigation(currentPartIndex - 1);
    };
    
    const handleRestart = () => {
        localStorage.removeItem('examSession');
        navigate('/');
    };
    
    const handlePlayAudio = () => {
        const audio = audioRef.current;
        const currentPart = examParts[currentPartIndex];
        if (audio && currentPart && 'audioSrc' in currentPart) {
            audio.currentTime = Math.max(0, (audioProgress[currentPart.audioSrc as string] || 0) - 5);
            audio.play();
            dispatch({ type: 'SET_HAS_PLAYBACK_STARTED', payload: true });
        }
    };

    const handleAudioTimeUpdate = () => {
        const audio = audioRef.current;
        const currentPart = examParts[currentPartIndex];
        if (audio && currentPart && 'audioSrc' in currentPart) {
            dispatch({ type: 'UPDATE_AUDIO_PROGRESS', payload: { src: currentPart.audioSrc as string, time: audio.currentTime } });
        }
    };

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
        return examParts.reduce((acc, part) => acc + getPartQuestionCount(part), 0);
    }, [examParts]);

    const areCurrentPartQuestionsAnswered = useMemo(() => {
        if (!examParts[currentPartIndex]) return false;
        const currentPart = examParts[currentPartIndex];
        let questionsToCheck: { id: string }[] = [];
        
        switch (currentPart.type) {
            case 'listening-part-1': questionsToCheck = (currentPart as ListeningPart1).textBlocks.flatMap(b => b.questions); break;
            case 'reading-part-2': questionsToCheck = (currentPart as ReadingPart2).texts.flatMap(t => t.questions); break;
            case 'reading-part-3': questionsToCheck = (currentPart as ReadingPart3).situations; break;
            case 'reading-part-4': questionsToCheck = (currentPart as ReadingPart4).opinions; break;
            default: questionsToCheck = currentPart.questions || []; break;
        }
        return questionsToCheck.every(q => allUserAnswers[q.id] !== undefined && allUserAnswers[q.id] !== '');
    }, [currentPartIndex, allUserAnswers, examParts]);


    // ... (Render logic remains exactly the same)
    if (isLoading) return <p className="text-center text-slate-600 mt-10">Prüfung wird geladen...</p>;
    if (error) return <p className="text-center text-red-600 font-semibold mt-10">{error}</p>;
    if (areAllExamsCompleted) return <AllExamsCompleted examType={examType} />;

    if (isSubmitted) {
        return <ResultsView 
            score={score} 
            totalQuestions={totalQuestions} 
            onRestart={handleRestart} 
            examParts={examParts} 
            allUserAnswers={allUserAnswers} 
            getPartQuestionCount={getPartQuestionCount} 
            timeTaken={timeTaken} 
        />;
    }

    if (examParts.length === 0 || !examParts[currentPartIndex]) {
        return <p className="text-center text-slate-600 mt-10">Prüfung wird vorbereitet...</p>;
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
            timeLeft={timeLeft}
        />
    );
};

export default ExamSession;