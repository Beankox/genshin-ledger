export type Element = 'Pyro' | 'Hydro' | 'Anemo' | 'Electro' | 'Dendro' | 'Cryo' | 'Geo';
export type WeaponType = 'Sword' | 'Claymore' | 'Polearm' | 'Bow' | 'Catalyst';
export type Rarity = 4 | 5;
export type SlotKey = 'flower' | 'plume' | 'sands' | 'goblet' | 'circlet';

/** Static facts about a character. Lives in data/characters.ts (or in `custom`). */
export interface Character {
  id: string;
  name: string;
  rarity: Rarity;
  element: Element;
  weapon: WeaponType;
  region: string;
  /** Image URL or data URL. Falls back to /portraits/<id>.png, then a generated placeholder. */
  portrait?: string;
}

export interface Substat { stat: string; value: string }
export interface ArtifactPiece { set: string; main: string; subs: Substat[] }
export interface Build {
  weapon: { name: string; level: number; refinement: number };
  artifacts: Record<SlotKey, ArtifactPiece>;
}

/** Which materials this character uses (names are free text, picked from suggestions). */
export interface Materials { book: string; boss: string; local: string; enemy: string; weekly: string }

/** The user's personal data for one character. */
export interface Progress {
  owned: boolean;
  level: number;
  ascension: number;
  constellation: number;
  friendship: number;
  talents: [number, number, number];
  notes: string;
  build: Build;
  materials: Materials;
  updatedAt: number | null;
}

/** Everything saved to LocalStorage / exported to JSON. */
export interface LedgerState {
  version: 1;
  custom: Character[];
  overrides: Record<string, Partial<Character>>;
  progress: Record<string, Progress>;
}
