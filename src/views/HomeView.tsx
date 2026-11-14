interface HomeViewProps {
  onNavigate: (tab: 'board' | 'review') => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Demo Hub & Match Selector</h2>
        <p className="text-sm text-slate-400 mt-1">
          Explore post-game strategy diagnostics and board state replays.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => onNavigate('board')}
          className="p-6 bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 rounded-xl cursor-pointer transition shadow-lg group"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">UI-03 Preview</span>
          <h3 className="text-lg font-bold text-white mt-1 group-hover:text-cyan-300 transition">
            Interactive Board Viewer
          </h3>
          <p className="text-xs text-slate-300 mt-2">
            View 2D board geometry, player piece distribution, and turn snapshots.
          </p>
          <button className="mt-4 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold rounded text-white transition">
            Launch Board &rarr;
          </button>
        </div>

        <div 
          onClick={() => onNavigate('review')}
          className="p-6 bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer transition shadow-lg group"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">UI-04 / UI-05 Preview</span>
          <h3 className="text-lg font-bold text-white mt-1 group-hover:text-emerald-300 transition">
            Game Review & Diagnostics
          </h3>
          <p className="text-xs text-slate-300 mt-2">
            Inspect turn-zero opening EV analysis, blunder flags, and candidate rankings[cite: 1].
          </p>
          <button className="mt-4 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded text-white transition">
            Launch Review &rarr;
          </button>
        </div>
      </div>

      {/* Placeholder for Follow-up Milestone */}
      <div className="p-8 border-2 border-dashed border-slate-800 rounded-xl text-center bg-slate-900/30">
        <p className="text-sm font-medium text-slate-400">Upload Session JSON Dropzone</p>
        <span className="inline-block mt-2 px-2.5 py-1 text-[11px] font-semibold bg-slate-800 text-amber-400 rounded-full border border-amber-500/30">
          UI-02 • Follow-up Ingestion Sprint[cite: 1, 3]
        </span>
      </div>
    </div>
  );
}