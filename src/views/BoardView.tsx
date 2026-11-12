export function BoardView() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold text-white">Board Viewer (UI-03)</h2>
          <p className="text-xs text-slate-400">Deterministic 2D SVG canvas preview[cite: 1]</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
          Fixture: Sample 4-Player Match[cite: 1]
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Board Viewport */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-xl min-h-[420px]">
          <svg viewBox="-150 -150 300 300" className="w-72 h-72 drop-shadow-md">
            {/* Center hex tile preview */}
            <polygon 
              points="0,-55 47.6,-27.5 47.6,27.5 0,55 -47.6,27.5 -47.6,-27.5" 
              fill="#eab308" 
              stroke="#ca8a04" 
              strokeWidth="3" 
            />
            <circle cx="0" cy="0" r="18" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
            <text x="0" y="6" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#713f12">
              8
            </text>
          </svg>
          <span className="text-xs text-slate-500 mt-4 font-mono">
            SVG Coordinate Root (-150 to 300 ViewBox)
          </span>
        </div>

        {/* Player Telemetry Standings */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Player Standings</h3>
          {[
            { seat: 'P1 Red', vp: 4, cards: 5, color: 'border-red-500/60 bg-red-950/20' },
            { seat: 'P2 Blue', vp: 5, cards: 7, color: 'border-blue-500/60 bg-blue-950/20' },
            { seat: 'P3 Orange', vp: 3, cards: 4, color: 'border-amber-500/60 bg-amber-950/20' },
            { seat: 'P4 White', vp: 4, cards: 6, color: 'border-slate-300/60 bg-slate-800/30' },
          ].map((p) => (
            <div key={p.seat} className={`p-3 border rounded-lg flex justify-between items-center ${p.color}`}>
              <span className="text-sm font-semibold text-white">{p.seat}</span>
              <span className="text-xs text-slate-300 font-mono">{p.vp} VPs • {p.cards} Cards</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}