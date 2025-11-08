import { 
    ExamPart, 
    ListeningPart1, 
    ReadingPart2, 
    ReadingPart3, 
    ReadingPart4, 
    MultipleChoiceQuestion, 
    TrueFalseQuestion, 
    ListeningPart4 
} from '../types';

interface FormatterParams {
    userId: string | null;
    examType: 'listening' | 'reading' | undefined;
    totalScore: number;
    totalQuestions: number;
    timeTakenInSeconds: number;
    examParts: ExamPart[];
    allUserAnswers: { [key: string]: any };
}

export const formatPerformanceData = ({
    userId,
    examType,
    totalScore,
    totalQuestions,
    timeTakenInSeconds,
    examParts,
    allUserAnswers
}: FormatterParams) => {
    return {
        userId,
        examType,
        totalScore,
        totalQuestions,
        timeTakenInSeconds,
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
};