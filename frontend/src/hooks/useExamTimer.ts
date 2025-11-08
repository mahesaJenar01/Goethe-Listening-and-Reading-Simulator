import { useEffect } from 'react';

interface UseExamTimerProps {
  isTimerActive: boolean;
  timeLeft: number;
  onTick: () => void;
  onTimeUp: () => void;
}

export function useExamTimer({ isTimerActive, timeLeft, onTick, onTimeUp }: UseExamTimerProps) {
  useEffect(() => {
    if (!isTimerActive) {
      return;
    }

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timerId = setInterval(onTick, 1000);

    return () => clearInterval(timerId);
  }, [isTimerActive, timeLeft, onTick, onTimeUp]);
}