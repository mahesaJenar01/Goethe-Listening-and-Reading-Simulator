import { useEffect } from 'react';
import { ExamAction, ExamState } from '../components/ExamSession';

export function useExamSessionStorage(
    state: ExamState, 
    dispatch: React.Dispatch<ExamAction>
) {
    // Effect to load state from localStorage ONCE on initial mount
    useEffect(() => {
        const savedSession = localStorage.getItem('examSession');
        if (savedSession) {
            try {
                const savedState = JSON.parse(savedSession);
                dispatch({ type: 'LOAD_FROM_STORAGE', payload: savedState });
            } catch (error) {
                console.error("Failed to parse exam session from localStorage", error);
                localStorage.removeItem('examSession');
            }
        }
    }, [dispatch]);

    // Effect to save state to localStorage whenever it changes
    useEffect(() => {
        if (state.examParts.length > 0 && !state.areAllExamsCompleted) {
            // By spreading the state and only overriding specific transient properties,
            // we ensure that audioProgress is now saved correctly.
            const sessionDataToSave = {
                ...state,
                playedListeningParts: Array.from(state.playedListeningParts),
                hasPlaybackStarted: false, // Always require user to press play after a refresh
            };
            localStorage.setItem('examSession', JSON.stringify(sessionDataToSave));
        }
    }, [state]);
}