import { ExamPart, ListeningPart1, ReadingPart2, ReadingPart3, ReadingPart4, MultipleChoiceQuestion, TrueFalseQuestion, ListeningPart4 } from '../types';

export const calculateScore = (examParts: ExamPart[], allUserAnswers: { [key: string]: any }): number => {
    let score = 0;
    examParts.forEach(part => {
        switch (part.type) {
            case 'listening-part-1':
                (part as ListeningPart1).textBlocks.forEach(block => {
                    const [tf, mc] = block.questions;
                    if (allUserAnswers[tf.id] === tf.correctAnswer) score++;
                    if (allUserAnswers[mc.id] === (mc as MultipleChoiceQuestion).correctAnswerIndex) score++;
                });
                break;
            case 'listening-part-2':
            case 'reading-part-5':
                (part as { questions: MultipleChoiceQuestion[] }).questions.forEach(q => {
                    if (allUserAnswers[q.id] === q.correctAnswerIndex) score++;
                });
                break;
            case 'listening-part-3':
            case 'reading-part-1':
                (part as { questions: TrueFalseQuestion[] }).questions.forEach(q => {
                    if (allUserAnswers[q.id] === q.correctAnswer) score++;
                });
                break;
            case 'listening-part-4':
                (part as ListeningPart4).questions.forEach(q => {
                    if (allUserAnswers[q.id] === q.correctAnswer) score++;
                });
                break;
            case 'reading-part-2':
                (part as ReadingPart2).texts.forEach(text => text.questions.forEach(q => {
                    if (allUserAnswers[q.id] === q.correctAnswerIndex) score++;
                }));
                break;
            case 'reading-part-3':
                (part as ReadingPart3).situations.forEach(sit => {
                    if (allUserAnswers[sit.id] === sit.correctAnswer) score++;
                });
                break;
            case 'reading-part-4':
                (part as ReadingPart4).opinions.forEach(op => {
                    if (allUserAnswers[op.id] === op.correctAnswer) score++;
                });
                break;
        }
    });
    return score;
};