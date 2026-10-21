import React from 'react';
import { AlertTriangle, Database, Loader2, RefreshCw } from 'lucide-react';
import type { SheetsState } from '../data/useSheetsSnapshot';

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

/** Data source bar: where the data comes from, when it was loaded, refresh and errors. */
export const SheetsDataStatus: React.FC<{ state: SheetsState }> = ({ state }) => {
  const { snapshot, loading, error, refresh } = state;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#A87B4E]/30 bg-[#3D2817]/50 px-4 py-2.5 text-xs">
      <div className="flex items-center gap-2 text-[#F5F2EB]/80 min-w-0">
        <Database className="w-4 h-4 text-[#A87B4E] flex-shrink-0" />
        {snapshot ? (
          <span>
            Data from the CGaRd Google Sheet · loaded {formatTime(snapshot.loadedAt)} ·{' '}
            {snapshot.tables.Products.length} products · {snapshot.tables.Claims.length} claims
          </span>
        ) : (
          <span>Loading data from the CGaRd Google Sheet…</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {error && snapshot && (
          <span className="flex items-center gap-1 text-amber-300" role="status">
            <AlertTriangle className="w-3.5 h-3.5" />
            Refresh failed — showing the data loaded earlier
          </span>
        )}
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-[#A87B4E]/50 px-3 py-1 font-bold text-[#F5F2EB] hover:bg-[#A87B4E]/30 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {loading ? 'Loading' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

/** Full-page state used before the first successful load. */
export const SheetsFirstLoad: React.FC<{ state: SheetsState }> = ({ state }) => {
  if (state.error) {
    return (
      <div className="rounded-2xl border border-red-500/50 bg-red-950/40 p-8 text-center space-y-3" role="alert">
        <AlertTriangle className="w-8 h-8 text-red-300 mx-auto" />
        <h2 className="text-lg font-bold text-white">Could not load the data</h2>
        <p className="text-sm text-[#F5F2EB]/80 max-w-xl mx-auto break-words">{state.error}</p>
        <button
          type="button"
          onClick={state.refresh}
          className="rounded-lg bg-[#A87B4E] px-4 py-2 text-sm font-bold text-white hover:bg-[#A87B4E]/80"
        >
          Try again
        </button>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-[#A87B4E]/30 bg-[#3D2817]/40 p-12 text-center text-[#F5F2EB]/70">
      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-[#A87B4E]" />
      Loading products from the Google Sheet…
    </div>
  );
};
