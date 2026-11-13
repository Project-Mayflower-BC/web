import { useState } from 'react';
import { SAMPLE_MATCH_TURNS } from '../fixtures/sampleMatch';
import type { MoveGrade } from '../types/game';

const GRADE_STYLES: Record<MoveGrade, { badge: string; border: string; label: string }> = {
  best: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', border: 'border-emerald-500/40', label: 'Best Move' },
  good: { badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', border: 'border-cyan-500/40', label: 'Good' },
  inaccuracy: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', border: 'border-amber-500/40', label: 'Inaccuracy' },
  mistake: { badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', border: 'border-orange-500/40', label: 'Mistake' },
  blunder: { badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', border: 'border-rose-500/40', label: 'Blunder' },
};

export function ReviewView() {
  const [selectedTurnIndex, setSelectedTurnIndex] = useState(0);

  const turns = SAMPLE_MATCH_TURNS;
  const activeTurn = turns[selectedTurnIndex];

  // Coordinates for the SVG Win-Probability Chart (Width 500, Height 140)
  const chartWidth = 500;
  const chartHeight = 120;
  const padding = 20;

  // Mock win-chance distribution for Player 1 (Red) across turns
  const redWinChances = [0.28, 0.32, 0.29, 0.25, 0.42];

  const points = redWinChances.map((prob, i) => {
    const x = padding + (i / (redWinChances.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - prob * (chartHeight - padding * 2);
    return { x, y, prob };
  });

  const svgPathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

  return (
    <div className="space-y-6">
      {/* Title & Diagnostic Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold text-white">Match Review & Diagnostics (UI-04 / UI-05)</h2>
          <p className="text-xs text-slate-400">Decision auditing, blunder classification, and win-chance trends</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
            Focus: Player 1 (Red)
          </span>
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-mono">
            Net EV: +14.0%
          </span>
        </div>
      </div>

      {/* Top Strip: Win Probability Trendline */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-slate-300">Win Probability Shift (Red)</span>
          <span className="font-mono text-cyan-400">Current: {(redWinChances[selectedTurnIndex] * 100).toFixed(1)}%</span>
        </div>

        {/* Responsive Vector Chart */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32 select-none">
            {/* 50% baseline rule */}
            <line
              x1={padding}
              y1={chartHeight / 2}
              x2={chartWidth - padding}
              y2={chartHeight / 2}
              stroke="#334155"
              strokeDasharray="4"
              strokeWidth="1"
            />
            {/* Trendline */}
            <path d={svgPathD} fill="none" stroke="#06b6d4" strokeWidth="2.5" />

            {/* Turn Nodes */}
            {points.map((pt, idx) => (
              <g
                key={idx}
                className="cursor-pointer"
                onClick={() => setSelectedTurnIndex(idx)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={selectedTurnIndex === idx ? 6 : 4}
                  fill={selectedTurnIndex === idx ? '#38bdf8' : '#0f172a'}
                  stroke="#06b6d4"
                  strokeWidth="2"
                />
                <text
                  x={pt.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill={selectedTurnIndex === idx ? '#38bdf8' : '#64748b'}
                  fontWeight={selectedTurnIndex === idx ? 'bold' : 'normal'}
                >
                  T{idx}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Bottom Grid: Turn Selector List & Move Diagnostic Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Turn Stepper Cards */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Recorded Turns
          </h3>
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {turns.map((turn, idx) => {
              const isSelected = selectedTurnIndex === idx;
              return (
                <div
                  key={turn.turnIndex}
                  onClick={() => setSelectedTurnIndex(idx)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/20 shadow-md'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">Turn {turn.turnIndex}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {turn.activeColor}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 truncate">{turn.actionDescription}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2 spans): Deep Evaluation Breakdown */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-5">
          <div className="flex justify-between items-start gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Turn {activeTurn.turnIndex} Evaluation
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {activeTurn.actionDescription}
              </h3>
            </div>
            {activeTurn.evaluation && (
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${GRADE_STYLES[activeTurn.evaluation.moveGrade].badge}`}>
                {GRADE_STYLES[activeTurn.evaluation.moveGrade].label}
              </span>
            )}
          </div>

          {/* Diagnostic Metrics Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Player Win Chance</span>
              <div className="text-xl font-bold text-cyan-400 mt-0.5">
                {(redWinChances[selectedTurnIndex] * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Expected Value Delta</span>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">
                {activeTurn.evaluation ? `+${(activeTurn.evaluation.deltaEV * 100).toFixed(1)}% EV` : '—'}
              </div>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Variance Assessment</span>
              <div className="text-xl font-bold text-slate-200 mt-0.5">
                {selectedTurnIndex === 0 ? 'About Equal' : 'Significant'}
              </div>
            </div>
          </div>

          {/* Plain-Language Coaching Explanation */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Coaching Advice & Alternatives
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeTurn.evaluation?.adviceSummary ||
                'Standard turn progression. Resource yields followed expected statistical dice probabilities without significant strategic divergence.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}