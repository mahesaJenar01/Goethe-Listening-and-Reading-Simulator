import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ResultsView from './ResultsView';
import { ExamPart, ListeningPart1, ReadingPart2, ReadingPart3, ReadingPart4 } from '../types';

const API_BASE_URL = 'http://127.0.0.1:5000';

interface DetailedResultData {
    score: number;
    totalQuestions: number;
    timeTaken: number | null;
    examParts: ExamPart[];
    allUserAnswers: { [key: string]: any };
}

const DetailedResultsView: React.FC = () => {
    const { examTimestamp } = useParams<{ examTimestamp: string }>();
    const { userId } = useAuth();
    const navigate = useNavigate();

    const [resultData, setResultData] = useState<DetailedResultData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId || !examTimestamp) return;
        const fetchResult = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/exam-result/${examTimestamp}?userId=${userId}`);
                if (!response.ok) throw new Error('Failed to fetch detailed exam results.');
                const data = await response.json();
                setResultData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchResult();
    }, [userId, examTimestamp]);
    
    const getPartQuestionCount = (part: ExamPart): number => {
        switch (part.type) {
            case 'listening-part-1': return (part as ListeningPart1).textBlocks.length * 2;
            case 'reading-part-2': return (part as ReadingPart2).texts.reduce((acc, text) => acc + text.questions.length, 0);
            case 'reading-part-3': return (part as ReadingPart3).situations.length;
            case 'reading-part-4': return (part as ReadingPart4).opinions.length;
            default: return part.questions.length;
        }
    };

    if (isLoading) return <p className="text-center text-slate-600 mt-10">Lade Ergebnisse...</p>;
    if (error) return <p className="text-center text-red-600 font-semibold mt-10">{error}</p>;
    if (!resultData) return <p className="text-center text-slate-500 mt-10">Ergebnisse konnten nicht geladen werden.</p>;

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Prüfungsergebnis</h2>
                 <p className="mt-1 text-slate-500">Dies ist die detaillierte Auswertung einer vergangenen Prüfung.</p>
            </div>

            <ResultsView
                score={resultData.score}
                totalQuestions={resultData.totalQuestions}
                onRestart={() => navigate('/history')}
                examParts={resultData.examParts}
                allUserAnswers={resultData.allUserAnswers}
                getPartQuestionCount={getPartQuestionCount}
                timeTaken={resultData.timeTaken}
            />
            <div className="text-center mt-8">
                 <Link to="/history" className="px-6 py-3 font-semibold rounded-lg shadow-md transition-colors duration-200 bg-slate-200 text-slate-800 hover:bg-slate-300">
                    Zurück zum Verlauf
                </Link>
            </div>
        </div>
    );
};

export default DetailedResultsView;