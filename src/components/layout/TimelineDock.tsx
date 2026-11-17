import { useEffect } from 'react';

interface TimelineDockProps {
  currentTurn: number;
  totalTurns: number;
  isPlaying: boolean;
  onTurnChange: (turn: number) => void;
  onTogglePlay: () => void;
}

export function TimelineDock({
  currentTurn,
  totalTurns,
  isPlaying,
  onTurnChange,
  onTogglePlay,
}: TimelineDockProps) {
  // Global keyboard listeners for arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onTurnChange(Math.max(0, currentTurn - 1));
      } else if (e.key === 'ArrowRight') {
        onTurnChange(Math.min(totalTurns - 1, currentTurn + 1));
      } else if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTurn, totalTurns, onTurnChange, onTogglePlay]);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Playback Button Group */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onTurnChange(0)}
          disabled={currentTurn === 0}
          className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 rounded transition"
          title="Jump to Start"
        >
          ⏮
        </button>
        <button
          onClick={() => onTurnChange(Math.max(0, currentTurn - 1))}
          disabled={currentTurn === 0}
          className="px-3 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 rounded transition"
          title="Step Backward (Left Arrow)"
        >
          ◀ Prev
        </button>
        <button
          onClick={onTogglePlay}
          className={`px-4 py-1 text-xs font-bold rounded transition text-white ${
            isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-cyan-600 hover:bg-cyan-500'
          }`}
          title="Play / Pause (Space)"
        >
          {isPlaying ? 'Pause' : 'Autoplay'}
        </button>
        <button
          onClick={() => onTurnChange(Math.min(totalTurns - 1, currentTurn + 1))}
          disabled={currentTurn === totalTurns - 1}
          className="px-3 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 rounded transition"
          title="Step Forward (Right Arrow)"
        >
          Next ▶
        </button>
        <button
          onClick={() => onTurnChange(totalTurns - 1)}
          disabled={currentTurn === totalTurns - 1}
          className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 rounded transition"
          title="Jump to End"
        >
          ⏭
        </button>
      </div>

      {/* Scrubber Slider & Turn Counter */}
      <div className="flex-1 flex items-center gap-4 w-full max-w-md">
        <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
          Turn <strong className="text-cyan-400">{currentTurn}</strong> of {totalTurns - 1}
        </span>
        <input
          type="range"
          min={0}
          max={totalTurns - 1}
          value={currentTurn}
          onChange={(e) => onTurnChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      <div className="text-[11px] text-slate-500 font-mono hidden md:block">
        Use [◀] [▶] or [Space]
      </div>
    </div>
  );
}