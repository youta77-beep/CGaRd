import { useCallback, useEffect, useRef, useState } from 'react';
import { loadPublicSheets, type SheetsSnapshot } from './publicSheets';

const TIMEOUT_MS = 20000;

export interface SheetsState {
  snapshot: SheetsSnapshot | null;
  /** True while a request is running (first load or refresh). */
  loading: boolean;
  /** Error from the most recent request; the last good snapshot is kept on refresh failure. */
  error: string | null;
  refresh: () => void;
}

/**
 * Loads the public Google Sheet once on mount and again on refresh().
 * A newer request always wins: results from an older, slower request are ignored.
 */
export function useSheetsSnapshot(): SheetsState {
  const [snapshot, setSnapshot] = useState<SheetsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    const id = ++requestId.current;
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);
    setLoading(true);
    setError(null);

    loadPublicSheets({ signal: abort.signal })
      .then((next) => {
        if (id !== requestId.current) return;
        setSnapshot(next);
      })
      .catch((err: unknown) => {
        if (id !== requestId.current) return;
        const message =
          abort.signal.aborted ? 'The Google Sheet did not respond in time.' : err instanceof Error ? err.message : String(err);
        setError(message);
      })
      .finally(() => {
        clearTimeout(timer);
        if (id === requestId.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
    return () => controller.current?.abort();
  }, [load]);

  return { snapshot, loading, error, refresh: load };
}
