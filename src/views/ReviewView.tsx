export function ReviewView() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold text-white">Strategy & Review Dashboard (UI-04 / UI-05)</h2>
        <p className="text-xs text-slate-400">Post-game evaluation overlays and blunder diagnostics[cite: 1, 7]</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-xl">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Setup Accuracy</span>
          <div className="text-2xl font-bold text-white mt-1">+4.2% EV</div>
          <p className="text-xs text-slate-400 mt-1">Starting spots provided high Wheat/Ore synergy[cite: 1].</p>
        </div>

        <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-xl">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Turn 18 Blunder</span>
          <div className="text-2xl font-bold text-white mt-1">-14.8% Win%</div>
          <p className="text-xs text-slate-400 mt-1">Trading 2 Ore to Blue enabled their second City[cite: 1].</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Variance Indicator</span>
          <div className="text-2xl font-bold text-slate-200 mt-1">About Equal</div>
          <p className="text-xs text-slate-400 mt-1">Setup spot #18 and #24 differed by &lt; 1.2% EV[cite: 1, 3].</p>
        </div>
      </div>
    </div>
  );
}