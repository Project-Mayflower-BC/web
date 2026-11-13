import { useState, useMemo, useEffect } from 'react';
import { OPENING_CANDIDATES_TURN_0, type CandidatePlacement } from '../fixtures/sampleMatch';
import { STANDARD_BOARD_HEXES } from '../fixtures/boardTopology';
import { SAMPLE_MATCH_TURNS } from '../fixtures/sampleMatch';
import { 
  axialToPixel, 
  getHexCornerPoints, 
  buildVertexMap, 
  buildEdgeList 
} from '../utils/coordinates';
import type { ResourceType, PlayerColor } from '../types/game';
import { TimelineDock } from '../components/layout/TimelineDock';

const HEX_SIZE = 54;

const RESOURCE_THEMES: Record<ResourceType, { fill: string; stroke: string; label: string }> = {
  wood:   { fill: '#166534', stroke: '#14532d', label: 'Lumber' },
  brick:  { fill: '#c2410c', stroke: '#9a3412', label: 'Brick' },
  sheep:  { fill: '#65a30d', stroke: '#4d7c0f', label: 'Wool' },
  wheat:  { fill: '#eab308', stroke: '#ca8a04', label: 'Grain' },
  ore:    { fill: '#64748b', stroke: '#475569', label: 'Ore' },
  desert: { fill: '#b45309', stroke: '#78350f', label: 'Desert' },
};

const PLAYER_COLORS: Record<PlayerColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  orange: '#f97316',
  white: '#f1f5f9',
};

interface BoardViewProps {
  currentTurn: number;
  onTurnChange: (turn: number) => void;
}

export function BoardView({ currentTurn, onTurnChange }: BoardViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const activeTurn = SAMPLE_MATCH_TURNS[currentTurn] || SAMPLE_MATCH_TURNS[0];

  const vertexMap = useMemo(() => buildVertexMap(STANDARD_BOARD_HEXES, HEX_SIZE), []);
  const edgeList = useMemo(() => buildEdgeList(STANDARD_BOARD_HEXES, HEX_SIZE, vertexMap), [vertexMap]);

  const [selectedCandidate, setSelectedCandidate] = useState<CandidatePlacement | null>(null);

  // Autoplay ticker updates shared state
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
    <div className="space-y-6">
      {/* Header & Match Metadata */}
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold text-white">Board Viewer & Replay (UI-03)</h2>
          <p className="text-xs text-slate-400">{activeTurn.actionDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTurn.diceRoll && (
            <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-amber-400 border border-slate-700 font-mono">
              Roll: [{activeTurn.diceRoll[0]}] + [{activeTurn.diceRoll[1]}] = {activeTurn.diceRoll[0] + activeTurn.diceRoll[1]}
            </span>
          )}
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-mono">
            Active: {activeTurn.activeColor.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Board Viewport */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[500px]">
          <svg
            viewBox="-280 -260 560 520"
            className="w-full h-auto max-w-[480px] drop-shadow-xl select-none"
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
                      strokeWidth="2.5"
                    />

                    {/* Number Chit */}
                    {hex.rollNumber !== null && (
                      <g opacity={hasRobber ? 0.35 : 1}>
                        <circle
                          cx={x}
                          cy={y}
                          r={18}
                          fill="#fef3c7"
                          stroke="#d97706"
                          strokeWidth="1.5"
                        />
                        <text
                          x={x}
                          y={y + 1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="15"
                          fontWeight="bold"
                          fill={isHighYield ? '#dc2626' : '#1e293b'}
                        >
                          {hex.rollNumber}
                        </text>
                        <text
                          x={x}
                          y={y + 11}
                          textAnchor="middle"
                          fontSize="10"
                          letterSpacing="1"
                          fill={isHighYield ? '#dc2626' : '#475569'}
                        >
                          {'•'.repeat(hex.pips)}
                        </text>
                      </g>
                    )}

                    {/* Robber Token */}
                    {hasRobber && (
                      <g className="transition-all duration-300">
                        <circle cx={x} cy={y} r={16} fill="#1e1e24" stroke="#e2e8f0" strokeWidth="2" />
                        <text
                          x={x}
                          y={y + 1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="10"
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

            {/* Road Placements */}
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
                    stroke={PLAYER_COLORS[road.ownerColor]}
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="drop-shadow transition-all duration-200"
                  />
                );
              })}
            </g>

            {/* Building Placements */}
            <g id="building-layer">
              {activeTurn.buildings.map((b) => {
                const pt = vertexMap.get(b.vertexId);
                if (!pt) return null;
                const color = PLAYER_COLORS[b.ownerColor];

                return (
                  <g key={`${b.vertexId}-${b.type}`} className="transition-all duration-200">
                    {b.type === 'settlement' ? (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={8}
                        fill={color}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="drop-shadow"
                      />
                    ) : (
                      <rect
                        x={pt.x - 9}
                        y={pt.y - 9}
                        width={18}
                        height={18}
                        rx={3}
                        fill={color}
                        stroke="#0f172a"
                        strokeWidth="2.5"
                        className="drop-shadow-lg"
                      />
                    )}
                  </g>
                );
              })}
            </g>

            {currentTurn === 0 && (
              <g id="candidate-overlay-layer">
                {OPENING_CANDIDATES_TURN_0.map((cand) => {
                  const pt = vertexMap.get(cand.vertexId);
                  if (!pt) return null;
                  const isSelected = selectedCandidate?.vertexId === cand.vertexId;

                  const ringColor =
                    cand.grade === 'best'
                      ? '#10b981' // Emerald
                      : cand.grade === 'good'
                      ? '#06b6d4' // Cyan
                      : '#f59e0b'; // Amber

                  return (
                    <g
                      key={cand.vertexId}
                      className="cursor-pointer transition-transform hover:scale-110"
                      onClick={() => setSelectedCandidate(cand)}
                    >
                      {/* Animated/Glowing outer pulse ring */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? 16 : 13}
                        fill="none"
                        stroke={ringColor}
                        strokeWidth={isSelected ? 3 : 2}
                        strokeDasharray={cand.isAboutEqual ? '3 2' : undefined}
                        className="animate-pulse"
                      />

                      {/* Center badge with Rank # */}
                      <circle cx={pt.x} cy={pt.y} r={9} fill="#0f172a" stroke={ringColor} strokeWidth="1.5" />
                      <text
                        x={pt.x}
                        y={pt.y + 0.5}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="10"
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

        {/* Sidebar: Dynamic Standings */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Player Standings
            </h3>
            {activeTurn.playerSummaries.map((p) => {
              const isActive = activeTurn.activeColor === p.color;
              return (
                <div
                  key={p.seatId}
                  className={`p-3 border rounded-lg flex justify-between items-center transition ${
                    isActive ? 'border-cyan-500 bg-cyan-950/20 shadow-md' : 'border-slate-800 bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PLAYER_COLORS[p.color] }}
                    />
                    <span className="text-xs font-semibold text-white">{p.name}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-300">
                    {p.victoryPoints} VPs • {p.totalCards} Cards
                  </span>
                </div>
              );
            })}
          </div>

          {currentTurn === 0 && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Opening Candidates (UI-04)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  Turn 0 Only
                </span>
              </div>

              {selectedCandidate ? (
                <div className="space-y-2 p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">
                      Rank #{selectedCandidate.rank} • Vertex {selectedCandidate.vertexId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        selectedCandidate.grade === 'best'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : selectedCandidate.grade === 'good'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {selectedCandidate.isAboutEqual ? '≈ About Equal' : selectedCandidate.grade.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm font-mono text-cyan-300">
                    {(selectedCandidate.winProbability * 100).toFixed(1)}% Win Rate (
                    {selectedCandidate.deltaEV >= 0 ? '+' : ''}
                    {(selectedCandidate.deltaEV * 100).toFixed(1)}% EV)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedCandidate.annotation}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Click any ranked node (#1, #2, #3) on the board to inspect opening placement EV tradeoffs.
                </p>
              )}
            </div>
          )}

          {/* 3. Move Quality Card (if present) */}
          {activeTurn.evaluation && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Move Quality: {activeTurn.evaluation.moveGrade.toUpperCase()}
              </span>
              <p className="text-xs text-slate-300">{activeTurn.evaluation.adviceSummary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Persistent Bottom Timeline Scrubber */}
      <TimelineDock
        currentTurn={currentTurn}
        totalTurns={SAMPLE_MATCH_TURNS.length}
        isPlaying={isPlaying}
        onTurnChange={onTurnChange}
        onTogglePlay={() => setIsPlaying((prev) => !prev)}
      />
    </div>
  );
}