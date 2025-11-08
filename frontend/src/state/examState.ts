import { ExamPart } from "../types";

// --- State Shape ---
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
    timeLeft: number;
    examStartTime: number | null;
    timeTaken: number | null;
}

// --- Action Types ---
export type ExamAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { parts: ExamPart[], totalTime: number } }
  | { type: 'FETCH_ALL_COMPLETED' }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'LOAD_FROM_STORAGE'; payload: Partial<ExamState> }
  | { type: 'ANSWER_QUESTION'; payload: { questionId: string; answer: any } }
  | { type: 'NAVIGATE_PART'; payload: { nextIndex: number, previousIndex: number } }
  | { type: 'SUBMIT_EXAM'; payload: { score: number, timeTaken: number } }
  | { type: 'UPDATE_AUDIO_PROGRESS'; payload: { src: string; time: number } }
  | { type: 'SET_AUDIO_STATUS'; payload: 'loading' | 'ready' | 'error' }
  | { type: 'SET_HAS_PLAYBACK_STARTED'; payload: boolean }
  | { type: 'TIMER_TICK' };

// --- Reducer Function ---
export const examReducer = (state: ExamState, action: ExamAction): ExamState => {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_SUCCESS':
            return { 
                ...state, 
                isLoading: false, 
                examParts: action.payload.parts,
                timeLeft: action.payload.totalTime,
                examStartTime: Date.now()
            };
        case 'FETCH_ALL_COMPLETED':
            return { ...state, isLoading: false, areAllExamsCompleted: true };
        case 'FETCH_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        
        case 'LOAD_FROM_STORAGE':
            const savedState = action.payload;
            return { 
                ...state, 
                ...savedState,
                playedListeningParts: new Set(savedState.playedListeningParts || []) 
            };

        case 'ANSWER_QUESTION':
            if (state.isSubmitted) return state;
            return {
                ...state,
                allUserAnswers: { ...state.allUserAnswers, [action.payload.questionId]: action.payload.answer },
            };

        case 'NAVIGATE_PART':
            const { nextIndex, previousIndex } = action.payload;
            const newPlayedParts = new Set(state.playedListeningParts);

            if (nextIndex > previousIndex) {
                const partJustLeft = state.examParts[previousIndex];
                if (partJustLeft?.type.startsWith('listening')) {
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
            return { ...state, isSubmitted: true, score: action.payload.score, timeTaken: action.payload.timeTaken };
        
        case 'UPDATE_AUDIO_PROGRESS':
            if (action.payload.time > (state.audioProgress[action.payload.src] || 0)) {
                return { ...state, audioProgress: { ...state.audioProgress, [action.payload.src]: action.payload.time }};
            }
            return state;

        case 'SET_AUDIO_STATUS':
            return { ...state, audioStatus: action.payload };

        case 'SET_HAS_PLAYBACK_STARTED':
            return { ...state, hasPlaybackStarted: action.payload };
        
        case 'TIMER_TICK':
            return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) };

        default:
            return state;
    }
};