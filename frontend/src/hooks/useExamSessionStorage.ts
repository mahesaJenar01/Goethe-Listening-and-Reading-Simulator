import { useEffect } from 'react';
import { ExamAction, ExamState } from '../state/examState';

// Define the durations here or import them if they are in a shared constants file
const EXAM_DURATIONS = {
    listening: 40 * 60, // 40 minutes
    reading: 65 * 60,   // 65 minutes
};

export function useExamSessionStorage(
    state: ExamState, 
    dispatch: React.Dispatch<ExamAction>,
    // Add examType to the hook's parameters
    examType: 'listening' | 'reading' | undefined
) {
    // Effect to load state from localStorage ONCE on initial mount
    useEffect(() => {
        // Don't try to load from storage if we don't know the exam type yet
        if (!examType) return;

        const savedSession = localStorage.getItem('examSession');
        if (savedSession) {
            try {
                const savedState = JSON.parse(savedSession);

                if (savedState.examStartTime) {
                    const totalTime = EXAM_DURATIONS[examType];
                    const elapsedTime = Math.floor((Date.now() - savedState.examStartTime) / 1000);
                    // This is the correct calculation
                    savedState.timeLeft = Math.max(0, totalTime - elapsedTime);
                }

                dispatch({ type: 'LOAD_FROM_STORAGE', payload: savedState });

            } catch (error) {
                console.error("Failed to parse exam session from localStorage", error);
                localStorage.removeItem('examSession');
            }
        }
    // Add examType to the dependency array
    }, [dispatch, examType]);

    // Effect to save state to localStorage whenever it changes
    useEffect(() => {
        if (state.examParts.length > 0 && !state.areAllExamsCompleted) {
            const sessionDataToSave = {
                ...state,
                playedListeningParts: Array.from(state.playedListeningParts),
                hasPlaybackStarted: false,
            };
            localStorage.setItem('examSession', JSON.stringify(sessionDataToSave));
        }
    }, [state]);
}