import { useEffect } from 'react';
import { ExamAction } from '../components/ExamSession'; // We will export these types

const API_BASE_URL = 'http://127.0.0.1:5000';

export function useFetchExam(
    { examType, userId, examParts, dispatch }: {
        examType: 'listening' | 'reading' | undefined;
        userId: string;
        examParts: any[];
        dispatch: React.Dispatch<ExamAction>;
    }
) {
    useEffect(() => {
        // Conditions to run the fetch:
        // 1. We have an examType.
        // 2. The examParts array is currently empty.
        // 3. There isn't an active session saved in localStorage (to prevent re-fetching on refresh).
        if (!examType || examParts.length > 0 || localStorage.getItem('examSession')) {
            return;
        }

        const fetchExam = async () => {
            dispatch({ type: 'FETCH_START' });
            try {
                const response = await fetch(`${API_BASE_URL}/api/${examType}-exam?userId=${userId}`);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                const data = await response.json();

                if (data.status === 'all_completed') {
                    dispatch({ type: 'FETCH_ALL_COMPLETED' });
                    localStorage.removeItem('examSession'); // Clean up just in case
                    return;
                }
                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error("Received empty or invalid exam data.");
                }
                
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (error: any) {
                dispatch({ type: 'FETCH_ERROR', payload: `Prüfung konnte nicht geladen werden: ${error.message}` });
            }
        };

        fetchExam();
    }, [examType, userId, examParts.length, dispatch]); // Dependencies for the fetch effect
}