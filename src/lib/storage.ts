import type { LedgerState } from '../types';
import { emptyState, normalizeState } from './ledger';

export const STORAGE_KEY = 'genshin-ledger:v1';

export function loadState(): LedgerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw)) ?? emptyState();
  } catch { /* corrupted or blocked storage: start fresh */ }
  return emptyState();
}

/** Returns false if the browser refused to save (storage full or disabled). */
export function saveState(state: LedgerState): boolean {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}

const BACKUP_KEY = 'genshin-ledger:v1:previous';
/** Keeps one copy of the data from before an import or reset so it can be undone. */
export function saveBackup(state: LedgerState) { try { localStorage.setItem(BACKUP_KEY, JSON.stringify(state)); } catch { /* storage full: skip */ } }
export function loadBackup(): LedgerState | null {
  try { const raw = localStorage.getItem(BACKUP_KEY); return raw ? normalizeState(JSON.parse(raw)) : null; } catch { return null; }
}

export const storageSize = () => {
  try { return Math.round(((localStorage.getItem(STORAGE_KEY) ?? '').length * 2) / 1024); } catch { return 0; }
};

export function downloadJson(state: LedgerState) {
  const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `genshin-ledger-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Shrinks an uploaded image to a small JPEG data URL so it fits in LocalStorage. */
export function imageToDataUrl(file: File, maxWidth = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image.')); };
    img.src = url;
  });
}
