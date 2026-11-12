import { STANDARD_BOARD_HEXES } from '../fixtures/boardTopology';
import { axialToPixel, getHexCornerPoints } from '../utils/coordinates';
import type { ResourceType } from '../types/game';

const HEX_SIZE = 54; // Hex outer radius in SVG units

const RESOURCE_THEMES: Record<ResourceType, { fill: string; stroke: string; label: string }> = {
  wood:   { fill: '#166534', stroke: '#14532d', label: 'Lumber' },
  brick:  { fill: '#c2410c', stroke: '#9a3412', label: 'Brick' },
  sheep:  { fill: '#65a30d', stroke: '#4d7c0f', label: 'Wool' },
  wheat:  { fill: '#eab308', stroke: '#ca8a04', label: 'Grain' },
  ore:    { fill: '#64748b', stroke: '#475569', label: 'Ore' },
  desert: { fill: '#b45309', stroke: '#78350f', label: 'Desert' },
};

export function BoardView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold text-white">Board Viewer (UI-03)</h2>
          <p className="text-xs text-slate-400">19-Hex Pointy-Topped Axial Projection</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-mono">
          Standard 4-Player Layout
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Board Viewport */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[500px]">
          <svg
            viewBox="-280 -260 560 520"
            className="w-full h-auto max-w-[480px] drop-shadow-xl select-none"
          >
            {/* Hex Layer */}
            <g id="hex-layer">
              {STANDARD_BOARD_HEXES.map((hex) => {
                const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
                const points = getHexCornerPoints(x, y, HEX_SIZE - 2);
                const theme = RESOURCE_THEMES[hex.resource];
                const isHighYield = hex.rollNumber === 6 || hex.rollNumber === 8;

                return (
                  <g key={hex.id} className="transition-transform duration-150 hover:opacity-90 cursor-pointer">
                    {/* Terrain Polygon */}
                    <polygon
                      points={points}
                      fill={theme.fill}
                      stroke={theme.stroke}
                      strokeWidth="2.5"
                    />

                    {/* Number Chit / Desert Marker */}
                    {hex.rollNumber !== null ? (
                      <g>
                        <circle
                          cx={x}
                          cy={y}
                          r={18}
                          fill="#fef3c7"
                          stroke="#d97706"
                          strokeWidth="1.5"
                          className="drop-shadow-sm"
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
                        {/* Probability Dots */}
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
                    ) : (
                      <g>
                        <circle cx={x} cy={y} r={14} fill="#78350f" opacity="0.8" />
                        <text
                          x={x}
                          y={y + 1}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="9"
                          fontWeight="600"
                          fill="#fef3c7"
                        >
                          ROB
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Coordinate Meta Info */}
          <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-400 font-mono">
            <span>Hexes: 19</span>
            <span>•</span>
            <span>ViewBox: 560x520</span>
            <span>•</span>
            <span className="text-rose-400">Red: 6 & 8 (5 pips)</span>
          </div>
        </div>

        {/* Sidebar: Telemetry & Terrain Legend */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Player Standings (Turn 0)
            </h3>
            {[
              { seat: 'P1 Red', vp: 2, cards: 0, color: 'border-red-500/50 bg-red-950/20 text-red-200' },
              { seat: 'P2 Blue', vp: 2, cards: 0, color: 'border-blue-500/50 bg-blue-950/20 text-blue-200' },
              { seat: 'P3 Orange', vp: 2, cards: 0, color: 'border-amber-500/50 bg-amber-950/20 text-amber-200' },
              { seat: 'P4 White', vp: 2, cards: 0, color: 'border-slate-400/50 bg-slate-800/30 text-slate-200' },
            ].map((p) => (
              <div key={p.seat} className={`p-2.5 border rounded-lg flex justify-between items-center ${p.color}`}>
                <span className="text-xs font-semibold">{p.seat}</span>
                <span className="text-xs font-mono opacity-80">{p.vp} VPs • {p.cards} Cards</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Terrain Key
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(Object.keys(RESOURCE_THEMES) as ResourceType[]).map((res) => (
                <div key={res} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border"
                    style={{
                      backgroundColor: RESOURCE_THEMES[res].fill,
                      borderColor: RESOURCE_THEMES[res].stroke,
                    }}
                  />
                  <span className="text-slate-300 capitalize">{RESOURCE_THEMES[res].label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}