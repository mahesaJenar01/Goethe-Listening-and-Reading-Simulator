import { useEffect } from 'react';
import { ExamAction } from '../state/examState';

const API_BASE_URL = 'http://127.0.0.1:5000';

export function useFetchExam(
    { examType, userId, examParts, dispatch, totalExamTime }: { // NEW: Add totalExamTime
        examType: 'listening' | 'reading' | undefined;
        userId: string;
        examParts: any[];
        dispatch: React.Dispatch<ExamAction>;
        totalExamTime: number; // NEW
    }
) {
    useEffect(() => {
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
                    localStorage.removeItem('examSession');
                    return;
                }
                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error("Received empty or invalid exam data.");
                }
                
                // NEW: Pass parts and totalTime in payload
                dispatch({ type: 'FETCH_SUCCESS', payload: { parts: data, totalTime: totalExamTime } });
            } catch (error: any) {
                dispatch({ type: 'FETCH_ERROR', payload: `Prüfung konnte nicht geladen werden: ${error.message}` });
            }
        };

        fetchExam();
    }, [examType, userId, examParts.length, dispatch, totalExamTime]); // NEW: Add totalExamTime to dependencies
}