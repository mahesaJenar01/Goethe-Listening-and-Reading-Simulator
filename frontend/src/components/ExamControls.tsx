import React from 'react';

interface ExamControlsProps {
  isLastPart: boolean;
  areCurrentPartQuestionsAnswered: boolean;
  currentPartIndex: number;
  onPreviousPart: () => void;
  onNextPart: () => void;
  onSubmit: () => void;
}

const ExamControls: React.FC<ExamControlsProps> = ({
  isLastPart,
  areCurrentPartQuestionsAnswered,
  currentPartIndex,
  onPreviousPart,
  onNextPart,
  onSubmit
}) => {
  return (
    <div className="mt-8 flex justify-between items-center">
      <button
        onClick={onPreviousPart}
        disabled={currentPartIndex === 0}
        className="px-6 py-3 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 bg-slate-200 text-slate-700 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
      >
        Vorheriger Teil
      </button>

      {isLastPart ? (
        <button onClick={onSubmit} disabled={!areCurrentPartQuestionsAnswered} className="px-8 py-3 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
          Prüfung abschicken
        </button>
      ) : (
        <button onClick={onNextPart} disabled={!areCurrentPartQuestionsAnswered} className="px-8 py-3 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
          Nächster Teil
        </button>
      )}
    </div>
  );
};

export default ExamControls;