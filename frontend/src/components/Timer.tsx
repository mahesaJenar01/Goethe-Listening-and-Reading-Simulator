import React from 'react';

interface TimerProps {
  timeLeft: number; // Time in seconds
}

const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Change color to red if less than 5 minutes are left
  const timerColor = timeLeft < 300 ? 'text-red-600' : 'text-slate-800';

  return (
    <div className={`text-2xl font-bold ${timerColor}`}>
      <span>Verbleibende Zeit: </span>
      <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
    </div>
  );
};

export default Timer;