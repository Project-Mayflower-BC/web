import { useMemo, useEffect, useState } from 'react';
import { STANDARD_BOARD_HEXES } from '../fixtures/boardTopology';
import { SAMPLE_MATCH_TURNS, OPENING_CANDIDATES_TURN_0, type CandidatePlacement } from '../fixtures/sampleMatch';
import { 
  axialToPixel, 
  getHexCornerPoints, 
  buildVertexMap, 
  buildEdgeList 
} from '../utils/coordinates';
import type { ResourceType, PlayerColor } from '../types/game';
import { TimelineDock } from '../components/layout/TimelineDock';

const HEX_SIZE = 76;

const RESOURCE_THEMES: Record<ResourceType, { fill: string; stroke: string; label: string }> = {
  wood:   { fill: '#166534', stroke: '#14532d', label: 'Lumber' },
  brick:  { fill: '#c2410c', stroke: '#9a3412', label: 'Brick' },
  sheep:  { fill: '#65a30d', stroke: '#4d7c0f', label: 'Wool' },
  wheat:  { fill: '#eab308', stroke: '#ca8a04', label: 'Grain' },
  ore:    { fill: '#64748b', stroke: '#475569', label: 'Ore' },
  desert: { fill: '#b45309', stroke: '#78350f', label: 'Desert' },
};

const PLAYER_COLORS: Record<PlayerColor, { fill: string; border: string }> = {
  red:    { fill: '#ef4444', border: 'border-red-500/50 bg-red-950/20' },
  blue:   { fill: '#3b82f6', border: 'border-blue-500/50 bg-blue-950/20' },
  orange: { fill: '#f97316', border: 'border-amber-500/50 bg-amber-950/20' },
  white:  { fill: '#f1f5f9', border: 'border-slate-400/50 bg-slate-800/30' },
};

interface BoardViewProps {
  currentTurn: number;
  onTurnChange: (turn: number) => void;
  onOpenReview?: () => void;
}

export function BoardView({ currentTurn, onTurnChange, onOpenReview }: BoardViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidatePlacement | null>(null);

  const activeTurn = SAMPLE_MATCH_TURNS[currentTurn] || SAMPLE_MATCH_TURNS[0];
  const vertexMap = useMemo(() => buildVertexMap(STANDARD_BOARD_HEXES, HEX_SIZE), []);
  const edgeList = useMemo(() => buildEdgeList(STANDARD_BOARD_HEXES, HEX_SIZE, vertexMap), [vertexMap]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (currentTurn >= SAMPLE_MATCH_TURNS.length - 1) {
        setIsPlaying(false);
      } else {
        onTurnChange(currentTurn + 1);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying, currentTurn, onTurnChange]);

  return (
    <div className="w-full space-y-4">
      {/* Top Header Strip */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">The Board Viewer</h2>
          <p className="text-xs text-slate-400">Current game state replay & interactive placement inspection</p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
          Standard 4-Player Match
        </span>
      </div>

      {/* Main Two-Column Layout */}
      <div 
        className="w-full"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 400px',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* LEFT COLUMN: Large Board Canvas + Under-Board Action Controls */}
        <div className="flex flex-col items-center gap-4 w-full">
          
          {/* Scaled-up Board Card Frame */}
          <div 
            className="flex items-center justify-center p-6 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            style={{ width: '100%', maxWidth: '820px', minHeight: '680px' }}
          >
            <svg
              viewBox="-400 -360 800 720"
              style={{ width: '100%', height: 'auto', maxHeight: '660px' }}
              className="drop-shadow-xl select-none"
            >
              {/* Hex Tiles */}
              <g id="hex-layer">
                {STANDARD_BOARD_HEXES.map((hex) => {
                  const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
                  const points = getHexCornerPoints(x, y, HEX_SIZE - 2);
                  const theme = RESOURCE_THEMES[hex.resource];
                  const isHighYield = hex.rollNumber === 6 || hex.rollNumber === 8;
                  const hasRobber = activeTurn.robberHexId === hex.id;

                  return (
                    <g key={hex.id}>
                      <polygon
                        points={points}
                        fill={theme.fill}
                        stroke={theme.stroke}
                        strokeWidth="3.5"
                      />

                      {hex.rollNumber !== null ? (
                        <g opacity={hasRobber ? 0.35 : 1}>
                          <circle
                            cx={x}
                            cy={y}
                            r={24}
                            fill="#fef3c7"
                            stroke="#d97706"
                            strokeWidth="2"
                          />
                          <text
                            x={x}
                            y={y + 1}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="20"
                            fontWeight="bold"
                            fill={isHighYield ? '#dc2626' : '#1e293b'}
                          >
                            {hex.rollNumber}
                          </text>
                          <text
                            x={x}
                            y={y + 14}
                            textAnchor="middle"
                            fontSize="13"
                            letterSpacing="2"
                            fill={isHighYield ? '#dc2626' : '#475569'}
                          >
                            {'•'.repeat(hex.pips)}
                          </text>
                        </g>
                      ) : (
                        <g>
                          <circle cx={x} cy={y} r={22} fill="#78350f" opacity="0.85" />
                          <text
                            x={x}
                            y={y + 1}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="12"
                            fontWeight="bold"
                            fill="#fef3c7"
                          >
                            DESERT
                          </text>
                        </g>
                      )}

                      {/* Robber Token */}
                      {hasRobber && (
                        <g className="transition-all duration-300">
                          <circle cx={x} cy={y} r={22} fill="#18181b" stroke="#e2e8f0" strokeWidth="2.5" />
                          <text
                            x={x}
                            y={y + 1}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="12"
                            fontWeight="bold"
                            fill="#f8fafc"
                          >
                            ROB
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Roads */}
              <g id="road-layer">
                {activeTurn.roads.map((road) => {
                  const edge = edgeList[road.edgeId];
                  if (!edge) return null;
                  const p1 = vertexMap.get(edge.v1);
                  const p2 = vertexMap.get(edge.v2);
                  if (!p1 || !p2) return null;

                  return (
                    <line
                      key={`${edge.id}-${road.ownerColor}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={PLAYER_COLORS[road.ownerColor].fill}
                      strokeWidth="8.5"
                      strokeLinecap="round"
                      className="drop-shadow transition-all duration-200"
                    />
                  );
                })}
              </g>

              {/* Buildings */}
              <g id="building-layer">
                {activeTurn.buildings.map((b) => {
                  const pt = vertexMap.get(b.vertexId);
                  if (!pt) return null;
                  const color = PLAYER_COLORS[b.ownerColor].fill;

                  return (
                    <g key={`${b.vertexId}-${b.type}`}>
                      {b.type === 'settlement' ? (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={12}
                          fill={color}
                          stroke="#0f172a"
                          strokeWidth="2.5"
                        />
                      ) : (
                        <rect
                          x={pt.x - 13}
                          y={pt.y - 13}
                          width={26}
                          height={26}
                          rx={4}
                          fill={color}
                          stroke="#0f172a"
                          strokeWidth="2.5"
                        />
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Candidate Overlays (Turn 0) */}
              {currentTurn === 0 && (
                <g id="candidate-overlay-layer">
                  {OPENING_CANDIDATES_TURN_0.map((cand) => {
                    const pt = vertexMap.get(cand.vertexId);
                    if (!pt) return null;
                    const isSelected = selectedCandidate?.vertexId === cand.vertexId;
                    const ringColor =
                      cand.grade === 'best'
                        ? '#10b981'
                        : cand.grade === 'good'
                        ? '#06b6d4'
                        : '#f59e0b';

                    return (
                      <g
                        key={cand.vertexId}
                        className="cursor-pointer"
                        onClick={() => setSelectedCandidate(cand)}
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isSelected ? 23 : 19}
                          fill="none"
                          stroke={ringColor}
                          strokeWidth={isSelected ? 4 : 2.5}
                          strokeDasharray={cand.isAboutEqual ? '4 3' : undefined}
                          className="animate-pulse"
                        />
                        <circle cx={pt.x} cy={pt.y} r={12} fill="#0f172a" stroke={ringColor} strokeWidth="2" />
                        <text
                          x={pt.x}
                          y={pt.y + 1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="13"
                          fontWeight="bold"
                          fill={ringColor}
                        >
                          #{cand.rank}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
          </div>

          {/* Under-Board Action Triggers & Scrubber */}
          <div className="w-full space-y-2" style={{ maxWidth: '820px' }}>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenReview}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-cyan-400 text-xs font-semibold rounded-lg transition"
              >
                Win Probability
              </button>
              <button
                onClick={() => alert("What-If branching will be available in Phase 3.")}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-semibold rounded-lg transition"
              >
                What If
              </button>
            </div>

            <TimelineDock
              currentTurn={currentTurn}
              totalTurns={SAMPLE_MATCH_TURNS.length}
              isPlaying={isPlaying}
              onTurnChange={onTurnChange}
              onTogglePlay={() => setIsPlaying((prev) => !prev)}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: "Standard Game Info" Panel */}
        <div 
          className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-4"
          style={{ 
            width: '400px', 
            minWidth: '400px', 
            padding: '20px', 
            boxSizing: 'border-box' 
          }}
        >
          {/* Section Header */}
          <div 
            className="border-b border-slate-800 pb-3"
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              width: '100%' 
            }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Standard Game Info
            </h3>
            <span 
              className="text-xs font-mono font-semibold rounded bg-slate-950 text-cyan-400 border border-slate-800"
              style={{ padding: '2px 8px' }}
            >
              Turn {activeTurn.turnIndex}
            </span>
          </div>

          {/* Current Action Card */}
          <div 
            className="bg-slate-950/70 border border-slate-800 rounded-xl space-y-2"
            style={{ padding: '14px' }}
          >
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                gap: '10px',
                width: '100%'
              }}
            >
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Action
              </span>
              <span 
                className="text-xs font-mono font-semibold rounded bg-slate-900 border border-slate-800 text-amber-300"
                style={{ padding: '2px 8px', whiteSpace: 'nowrap' }}
              >
                {activeTurn.diceRoll 
                  ? `Roll: [${activeTurn.diceRoll[0]}] + [${activeTurn.diceRoll[1]}] = ${activeTurn.diceRoll[0] + activeTurn.diceRoll[1]}` 
                  : 'Setup Phase'}
              </span>
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed pt-1">
              {activeTurn.actionDescription}
            </p>
          </div>

          {/* Players & Standings */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Players & Cards
            </span>
            <div className="space-y-2">
              {activeTurn.playerSummaries.map((p) => {
                const isActive = activeTurn.activeColor === p.color;
                const style = PLAYER_COLORS[p.color];
                return (
                  <div
                    key={p.seatId}
                    className={`border rounded-xl transition ${
                      isActive 
                        ? 'border-cyan-500/60 bg-cyan-950/20 shadow-sm' 
                        : 'border-slate-800/80 bg-slate-950/50'
                    }`}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '10px 14px',
                      gap: '12px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Left: Color dot, Name, Active Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        className="rounded-full shadow-sm"
                        style={{ 
                          width: '12px', 
                          height: '12px', 
                          backgroundColor: style.fill, 
                          display: 'inline-block',
                          flexShrink: 0
                        }}
                      />
                      <span className="text-xs font-semibold text-white" style={{ whiteSpace: 'nowrap' }}>
                        {p.name}
                      </span>
                      {isActive && (
                        <span 
                          className="text-[10px] font-bold uppercase tracking-wider rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          style={{ padding: '1px 6px', whiteSpace: 'nowrap' }}
                        >
                          Active
                        </span>
                      )}
                    </div>

                    {/* Right: Metrics kept on the same line */}
                    <div 
                      className="text-xs font-mono text-slate-300"
                      style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      <strong className="text-white">{p.victoryPoints}</strong> VPs &nbsp;•&nbsp; {p.totalCards} Cards
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Opening Placement Review (Turn 0) */}
          {currentTurn === 0 && (
            <div 
              className="bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5"
              style={{ padding: '14px' }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  width: '100%' 
                }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Opening Review
                </span>
                <span 
                  className="text-[10px] font-mono font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700"
                  style={{ padding: '1px 6px' }}
                >
                  UI-04
                </span>
              </div>

              {selectedCandidate ? (
                <div className="space-y-1.5 text-xs pt-1">
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      gap: '8px',
                      width: '100%' 
                    }}
                  >
                    <span className="font-bold text-white" style={{ whiteSpace: 'nowrap' }}>
                      Rank #{selectedCandidate.rank} (Vertex {selectedCandidate.vertexId})
                    </span>
                    <span
                      className={`text-[10px] font-bold rounded ${
                        selectedCandidate.grade === 'best'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : selectedCandidate.grade === 'good'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                      style={{ padding: '1px 6px', whiteSpace: 'nowrap' }}
                    >
                      {selectedCandidate.isAboutEqual ? '≈ About Equal' : selectedCandidate.grade.toUpperCase()}
                    </span>
                  </div>
                  <div className="font-mono text-cyan-300 text-xs">
                    {(selectedCandidate.winProbability * 100).toFixed(1)}% Win Rate ({selectedCandidate.deltaEV >= 0 ? '+' : ''}{(selectedCandidate.deltaEV * 100).toFixed(1)}% EV)
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {selectedCandidate.annotation}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic leading-relaxed">
                  Select candidate #1, #2, or #3 on the board to inspect initial placement EV.
                </p>
              )}
            </div>
          )}

          {/* Mid-Game Move Evaluation */}
          {activeTurn.evaluation && currentTurn > 0 && (
            <div 
              className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl space-y-1.5"
              style={{ padding: '14px' }}
            >
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Move Grade: {activeTurn.evaluation.moveGrade.toUpperCase()}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeTurn.evaluation.adviceSummary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}