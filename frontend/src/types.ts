export interface TrueFalseQuestion {
  id: string;
  type: 'true-false';
  statement: string;
  correctAnswer: boolean;
  explanation: string;
}

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface SpeakerAssignmentQuestion {
  id: string;
  type: 'speaker-assignment';
  statement: string;
  correctAnswer: string; // The key of the speaker
  explanation: string;
}

export type Gender = 'male' | 'female';

export interface DialogueLine {
  speaker: string;
  line: string;
}

// --- Listening Exam Part Structures (with new consistent types) ---

export interface ListeningPart1 {
  id: string;
  type: 'listening-part-1'; // CHANGED
  audioSrc: string;
  instruction: string;
  example: {
    context: string;
    preReadInstruction: string;
    speakerGender: Gender;
    transcript: string;
    questions: [TrueFalseQuestion, MultipleChoiceQuestion];
  };
  textBlocks: {
    context: string;
    preReadInstruction: string;
    speakerGender: Gender;
    transcript: string;
    questions: [TrueFalseQuestion, MultipleChoiceQuestion];
  }[];
}

export interface ListeningPart2 {
  id: string;
  type: 'listening-part-2'; // CHANGED
  audioSrc: string;
  instruction: string;
  context: string;
  preReadInstruction: string;
  speakerGender: Gender;
  transcript: string;
  questions: MultipleChoiceQuestion[];
}

export interface ListeningPart3 {
  id: string;
  type: 'listening-part-3'; // CHANGED
  audioSrc: string;
  instruction: string;
  context: string;
  preReadInstruction: string;
  dialogueSpeakers: {
    name: string;
    gender: Gender;
  }[];
  transcript: DialogueLine[];
  questions: TrueFalseQuestion[];
}

export interface Speaker {
  key: string; 
  name: string;
  role: string;
  gender: Gender;
}

export interface ListeningPart4 {
  id: string;
  type: 'listening-part-4'; // CHANGED
  audioSrc: string;
  instruction: string;
  context: string;
  preReadInstruction: string;
  speakers: Speaker[];
  transcript: DialogueLine[];
  example: {
    statement: string;
    correctAnswer: string;
  };
  questions: SpeakerAssignmentQuestion[];
}

// --- Reading Exam Part Structures ---

export interface ReadingPart1 {
  id: string;
  type: 'reading-part-1';
  instruction: string;
  workingTime: string;
  blog: {
    title: string;
    author: string;
    date: string;
    content: string[];
  };
  example: TrueFalseQuestion;
  questions: TrueFalseQuestion[];
}

export interface ReadingPart2Text {
  source: string;
  title: string;
  content: string[];
  questions: MultipleChoiceQuestion[];
}

export interface ReadingPart2 {
  id: string;
  type: 'reading-part-2';
  instruction: string;
  workingTime: string;
  texts: ReadingPart2Text[];
}

export interface Advertisement {
    key: string;
    title: string;
    content: string;
}

export interface Situation {
    id: string;
    number: number | string;
    description: string;
    correctAnswer: string;
    explanation: string;
}

export interface ReadingPart3 {
    id: string;
    type: 'reading-part-3';
    instruction: string;
    workingTime: string;
    example: Situation;
    situations: Situation[];
    advertisements: Advertisement[];
}

export interface Opinion {
    id: string;
    number: number | string;
    name: string;
    text: string;
    correctAnswer: boolean;
    explanation: string;
}

export interface ReadingPart4 {
    id: string;
    type: 'reading-part-4';
    instruction: string;
    workingTime: string;
    topic: string;
    introduction: string;
    example: Opinion;
    opinions: Opinion[];
}

export interface RegulationParagraph {
    heading: string;
    text: string;
}

export interface ReadingPart5 {
    id: string;
    type: 'reading-part-5';
    instruction: string;
    workingTime: string;
    regulations: {
        title: string;
        paragraphs: RegulationParagraph[];
    };
    questions: MultipleChoiceQuestion[];
}

export interface PerformanceTrendData {
  date: string;
  score: number;
  examType: 'listening' | 'reading';
}

export interface StatData {
    averageScore: number;
    completedExams: number;
    totalExams: number;
}

export interface DashboardStats {
    listening: StatData;
    reading: StatData;
    performanceTrend: PerformanceTrendData[];
}


// Union type for any possible Part (UPDATED)
export type ExamPart = 
  | ListeningPart1 
  | ListeningPart2 
  | ListeningPart3 
  | ListeningPart4 
  | ReadingPart1 
  | ReadingPart2 
  | ReadingPart3 
  | ReadingPart4 
  | ReadingPart5;