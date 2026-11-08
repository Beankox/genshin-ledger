import type { ArtifactPiece, SlotKey } from '../types';

const num = (v: string) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

/** CRIT Value of one artifact: CRIT Rate x 2 + CRIT DMG, counting substats only. */
export function critValue(piece?: ArtifactPiece): number {
  if (!piece) return 0;
  return piece.subs.reduce((sum, s) => {
    if (s.stat === 'CRIT Rate%') return sum + num(s.value) * 2;
    if (s.stat === 'CRIT DMG%') return sum + num(s.value);
    return sum;
  }, 0);
}

/** Total CRIT Value of everything a character wears. */
export function buildCritValue(artifacts?: Partial<Record<SlotKey, ArtifactPiece>>): number {
  return Object.values(artifacts ?? {}).reduce((sum, p) => sum + critValue(p), 0);
}

/** Rough label for a single piece. */
export function pieceLabel(cv: number): string {
  if (cv >= 40) return 'Excellent';
  if (cv >= 30) return 'Great';
  if (cv >= 20) return 'Good';
  if (cv >= 10) return 'Okay';
  return 'Low';
}

/** Rough label for a full five-piece build. */
export function buildLabel(total: number): string {
  if (total >= 200) return 'Endgame';
  if (total >= 150) return 'Strong';
  if (total >= 100) return 'Solid';
  if (total >= 50) return 'Developing';
  return 'Early';
}
