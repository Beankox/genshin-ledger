import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Character, LedgerState, Progress } from '../types';
import { BASE_CHARACTERS } from '../data/characters';
import { diffOverride, emptyProgress, emptyState } from '../lib/ledger';
import { loadState, saveState } from '../lib/storage';

const BASE_IDS = new Set(BASE_CHARACTERS.map((c) => c.id));
const BASE_BY_ID = new Map(BASE_CHARACTERS.map((c) => [c.id, c]));

export function useLedger() {
  const [state, setState] = useState<LedgerState | null>(null); // null = still loading
  const [saveFailed, setSaveFailed] = useState(false);
  const latest = useRef<LedgerState | null>(null);
  const dirty = useRef(false);

  useEffect(() => { setState(loadState()); }, []);

  const flush = useCallback(() => {
    if (!dirty.current || !latest.current) return;
    dirty.current = false;
    setSaveFailed(!saveState(latest.current));
  }, []);

  // Save shortly after the last change (not on every keystroke), and always before the tab is hidden or closed.
  useEffect(() => {
    if (!state) return;
    latest.current = state;
    dirty.current = true;
    const t = setTimeout(flush, 300);
    return () => clearTimeout(t);
  }, [state, flush]);
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => { document.removeEventListener('visibilitychange', onHide); window.removeEventListener('pagehide', flush); flush(); };
  }, [flush]);

  const characters = useMemo<Character[]>(() => {
    if (!state) return [];
    return [...BASE_CHARACTERS.map((c) => ({ ...c, ...state.overrides[c.id] })), ...state.custom.filter((c) => !BASE_IDS.has(c.id))];
  }, [state]);

  const progressOf = useCallback((id: string): Progress => state?.progress[id] ?? emptyProgress(), [state]);
  const isCustom = useCallback((id: string) => !BASE_IDS.has(id), []);
  const isEdited = useCallback((id: string) => !!state?.overrides[id], [state]);

  const patchProgress = useCallback((id: string, fn: (p: Progress) => Progress) =>
    setState((s) => s && ({ ...s, progress: { ...s.progress, [id]: { ...fn(s.progress[id] ?? emptyProgress()), updatedAt: Date.now() } } })), []);

  const saveCharacter = useCallback((c: Character) => setState((s) => {
    if (!s) return s;
    const base = BASE_BY_ID.get(c.id);
    if (base) {
      const overrides = { ...s.overrides };
      const patch = diffOverride(base, c);
      if (Object.keys(patch).length) overrides[c.id] = patch; else delete overrides[c.id];
      return { ...s, overrides };
    }
    const exists = s.custom.some((x) => x.id === c.id);
    return { ...s, custom: exists ? s.custom.map((x) => (x.id === c.id ? c : x)) : [...s.custom, c] };
  }), []);

  const restoreCharacter = useCallback((id: string) => setState((s) => {
    if (!s) return s;
    const { [id]: _removed, ...overrides } = s.overrides;
    return { ...s, overrides };
  }), []);

  const deleteCharacter = useCallback((id: string) => setState((s) => {
    if (!s) return s;
    const { [id]: _removed, ...progress } = s.progress;
    return { ...s, custom: s.custom.filter((c) => c.id !== id), progress };
  }), []);

  return {
    loading: state === null, saveFailed, state: state ?? emptyState(), characters,
    progressOf, isCustom, isEdited, patchProgress, saveCharacter, restoreCharacter, deleteCharacter,
    replaceAll: (s: LedgerState) => setState(s),
    resetAll: () => setState(emptyState()),
  };
}
export type Ledger = ReturnType<typeof useLedger>;
