import React from 'react';
import { ExamPart } from '../types';
import Timer from './Timer';

interface ExamPartHeaderProps {
  currentPart: ExamPart;
  currentPartIndex: number;
  timeLeft: number;
  examType: 'listening' | 'reading';
  audioRef: React.RefObject<HTMLAudioElement>;
  audioStatus: 'loading' | 'ready' | 'error';
  playedListeningParts: Set<number>;
  hasPlaybackStarted: boolean;
  onPlayAudio: () => void;
  onAudioTimeUpdate: () => void;
  onSetAudioStatus: (status: 'loading' | 'ready' | 'error') => void;
}

const ExamPartHeader: React.FC<ExamPartHeaderProps> = ({
  currentPart,
  currentPartIndex,
  timeLeft,
  examType,
  audioRef,
  audioStatus,
  playedListeningParts,
  hasPlaybackStarted,
  onPlayAudio,
  onAudioTimeUpdate,
  onSetAudioStatus
}) => {
  return (
    <div className="mb-6 bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Teil {currentPartIndex + 1}</h2>
        <Timer timeLeft={timeLeft} />
      </div>
      <p className="mt-2 text-slate-600">{currentPart.instruction}</p>
      
      {'workingTime' in currentPart && (
        <p className="mt-2 text-sm text-slate-500 font-medium">Arbeitszeit: {currentPart.workingTime}</p>
      )}

      {examType === 'listening' && 'audioSrc' in currentPart && (
        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={onPlayAudio}
            disabled={audioStatus !== 'ready' || playedListeningParts.has(currentPartIndex) || hasPlaybackStarted}
            className="flex-shrink-0 p-3 rounded-full shadow-md transition-all duration-300 bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.838l3.423-1.994a1 1 0 000-1.676l-3.423-1.994z" /></svg>
          </button>
          <audio
            ref={audioRef}
            src={(currentPart as any).audioSrc}
            onCanPlay={() => onSetAudioStatus('ready')}
            onError={() => onSetAudioStatus('error')}
            onTimeUpdate={onAudioTimeUpdate}
          />
          <p className="text-md text-slate-500">{audioStatus === 'loading' ? 'Audio wird geladen...' : audioStatus === 'ready' ? (playedListeningParts.has(currentPartIndex) ? 'Audio kann nicht wiederholt werden.' : 'Hörtext bereit.') : 'Fehler beim Laden des Audios.'}</p>
        </div>
      )}
    </div>
  );
};

export default ExamPartHeader;