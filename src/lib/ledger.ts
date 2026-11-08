import type { ArtifactPiece, Build, Character, Element, LedgerState, Materials, Progress, SlotKey, WeaponType } from '../types';
import { ELEMENTS, SLOTS, WEAPON_TYPES } from '../data/constants';

export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number.isFinite(n) ? n : min)));

/** Max level for each ascension phase 0–6. */
export const ASC_CAPS = [20, 40, 50, 60, 70, 80, 90];
export const requiredAscension = (lv: number) => (lv > 80 ? 6 : lv > 70 ? 5 : lv > 60 ? 4 : lv > 50 ? 3 : lv > 40 ? 2 : lv > 20 ? 1 : 0);

export const emptyPiece = (slot: SlotKey): ArtifactPiece => ({
  set: '',
  main: slot === 'flower' ? 'HP' : slot === 'plume' ? 'ATK' : '',
  subs: [0, 1, 2, 3].map(() => ({ stat: '', value: '' })),
});
export const emptyBuild = (): Build => ({
  weapon: { name: '', level: 1, refinement: 1 },
  artifacts: Object.fromEntries(SLOTS.map((s) => [s.key, emptyPiece(s.key)])) as Build['artifacts'],
});
export const emptyMaterials = (): Materials => ({ book: '', boss: '', local: '', enemy: '', weekly: '' });
export const emptyProgress = (): Progress => ({
  owned: false, level: 1, ascension: 0, constellation: 0, friendship: 1,
  talents: [1, 1, 1], notes: '', build: emptyBuild(), materials: emptyMaterials(), updatedAt: null,
});
export const emptyState = (): LedgerState => ({ version: 1, custom: [], overrides: {}, progress: {} });

/* ---------- validation (used for imports and for loading saved data) ---------- */
type Rec = Record<string, unknown>;
const rec = (x: unknown): Rec => (x && typeof x === 'object' && !Array.isArray(x) ? (x as Rec) : {});
const str = (x: unknown, d = '') => (typeof x === 'string' ? x : d);
const num = (x: unknown, d: number) => (typeof x === 'number' ? x : d);

function normalizePiece(raw: unknown, slot: SlotKey): ArtifactPiece {
  const r = rec(raw), base = emptyPiece(slot);
  const subs = Array.isArray(r.subs) ? r.subs : [];
  return {
    set: str(r.set), main: str(r.main, base.main),
    subs: base.subs.map((_, i) => ({ stat: str(rec(subs[i]).stat), value: str(rec(subs[i]).value) })),
  };
}

export function normalizeProgress(raw: unknown): Progress {
  const r = rec(raw), b = rec(r.build), w = rec(b.weapon), a = rec(b.artifacts), m = rec(r.materials);
  const t = Array.isArray(r.talents) ? r.talents : [];
  const level = clamp(num(r.level, 1), 1, 90);
  return {
    owned: r.owned === true,
    level,
    ascension: Math.max(requiredAscension(level), clamp(num(r.ascension, 0), 0, 6)),
    constellation: clamp(num(r.constellation, 0), 0, 6),
    friendship: clamp(num(r.friendship, 1), 1, 10),
    talents: [0, 1, 2].map((i) => clamp(num(t[i], 1), 1, 10)) as Progress['talents'],
    notes: str(r.notes),
    build: {
      weapon: { name: str(w.name), level: clamp(num(w.level, 1), 1, 90), refinement: clamp(num(w.refinement, 1), 1, 5) },
      artifacts: Object.fromEntries(SLOTS.map((s) => [s.key, normalizePiece(a[s.key], s.key)])) as Build['artifacts'],
    },
    materials: { book: str(m.book), boss: str(m.boss), local: str(m.local), enemy: str(m.enemy), weekly: str(m.weekly) } satisfies Materials,
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : null,
  };
}

function normalizeCharacter(raw: unknown): Character | null {
  const r = rec(raw);
  if (!str(r.id) || !str(r.name).trim()) return null;
  if (!ELEMENTS.includes(r.element as Element) || !WEAPON_TYPES.includes(r.weapon as WeaponType)) return null;
  return {
    id: str(r.id), name: str(r.name).trim(), rarity: r.rarity === 4 ? 4 : 5,
    element: r.element as Element, weapon: r.weapon as WeaponType,
    region: str(r.region, 'Unknown') || 'Unknown', portrait: str(r.portrait) || undefined,
  };
}

/** Returns a safe LedgerState, or null if `raw` is not a ledger at all. */
export function normalizeState(raw: unknown): LedgerState | null {
  const r = rec(raw);
  if (typeof r.version === 'number' && r.version > 1) return null; // made by a newer version of the app
  if (!Array.isArray(r.custom) || typeof r.progress !== 'object' || r.progress === null) return null;
  const overrides: LedgerState['overrides'] = {};
  for (const [id, o] of Object.entries(rec(r.overrides))) {
    const ov = rec(o), patch: Partial<Character> = {};
    if (str(ov.name).trim()) patch.name = str(ov.name).trim();
    if (ov.rarity === 4 || ov.rarity === 5) patch.rarity = ov.rarity;
    if (ELEMENTS.includes(ov.element as Element)) patch.element = ov.element as Element;
    if (WEAPON_TYPES.includes(ov.weapon as WeaponType)) patch.weapon = ov.weapon as WeaponType;
    if (str(ov.region)) patch.region = str(ov.region);
    if (str(ov.portrait)) patch.portrait = str(ov.portrait);
    overrides[id] = patch;
  }
  const progress: LedgerState['progress'] = {};
  for (const [id, p] of Object.entries(rec(r.progress))) progress[id] = normalizeProgress(p);
  return {
    version: 1,
    custom: r.custom.map(normalizeCharacter).filter((c): c is Character => c !== null),
    overrides, progress,
  };
}

/** Only the fields that differ from the built-in character, so later fixes to the roster still reach edited characters. */
export function diffOverride(base: Character, c: Character): Partial<Character> {
  const patch: Partial<Character> = {};
  if (c.name !== base.name) patch.name = c.name;
  if (c.rarity !== base.rarity) patch.rarity = c.rarity;
  if (c.element !== base.element) patch.element = c.element;
  if (c.weapon !== base.weapon) patch.weapon = c.weapon;
  if (c.region !== base.region) patch.region = c.region;
  const portrait = c.portrait || undefined;
  if (portrait && portrait !== base.portrait) patch.portrait = portrait;
  return patch;
}

export const timeAgo = (t: number) => {
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
};
