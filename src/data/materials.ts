import type { Element } from '../types';

/* Item names come from Game8's "List of Character Ascension Materials". */

/** Ascension gem family for each element. Tiers: Sliver, Fragment, Chunk, Gemstone. */
export const GEM_FAMILY: Record<Element, string> = {
  Pyro: 'Agnidus Agate', Hydro: 'Varunada Lazurite', Anemo: 'Vayuda Turquoise', Electro: 'Vajrada Amethyst',
  Dendro: 'Nagadus Emerald', Cryo: 'Shivada Jade', Geo: 'Prithiva Topaz',
};
export const GEM_TIERS = ['Sliver', 'Fragment', 'Chunk', 'Gemstone'] as const;
/** The Traveler uses the universal gem. */
export const gemFamilyFor = (id: string, element: Element) => (id === 'traveler' ? 'Brilliant Diamond' : GEM_FAMILY[element]);

/** Talent books, three per nation. `days` is the farming schedule (every book is available on Sunday). */
export const TALENT_BOOKS: { nation: string; books: { name: string; days?: string }[] }[] = [
  { nation: 'Mondstadt', books: [{ name: 'Freedom', days: 'Mon/Thu' }, { name: 'Resistance', days: 'Tue/Fri' }, { name: 'Ballad', days: 'Wed/Sat' }] },
  { nation: 'Liyue', books: [{ name: 'Prosperity', days: 'Mon/Thu' }, { name: 'Diligence', days: 'Tue/Fri' }, { name: 'Gold', days: 'Wed/Sat' }] },
  { nation: 'Inazuma', books: [{ name: 'Transience', days: 'Mon/Thu' }, { name: 'Elegance', days: 'Tue/Fri' }, { name: 'Light', days: 'Wed/Sat' }] },
  { nation: 'Sumeru', books: [{ name: 'Admonition', days: 'Mon/Thu' }, { name: 'Ingenuity', days: 'Tue/Fri' }, { name: 'Praxis', days: 'Wed/Sat' }] },
  { nation: 'Fontaine', books: [{ name: 'Equity', days: 'Mon/Thu' }, { name: 'Justice', days: 'Tue/Fri' }, { name: 'Order', days: 'Wed/Sat' }] },
  { nation: 'Natlan', books: [{ name: 'Conflict', days: 'Mon/Thu' }, { name: 'Contention', days: 'Tue/Fri' }, { name: 'Kindling', days: 'Wed/Sat' }] },
  { nation: 'Nod-Krai', books: [{ name: 'Moonlight' }, { name: 'Elysium' }, { name: 'Vagrancy' }] },
  { nation: 'Snezhnaya', books: [{ name: 'Charity' }, { name: 'Fortitude' }, { name: 'Glory' }] },
];

/** Suggestions for the free-text fields (1-star common drops and the 4-star boss/elite drops on the Game8 list). */
export const ENEMY_DROPS = [
  'Broken Drive Shaft', 'Chimeric Core', 'Damaged Mask', 'Divining Scroll', 'Ethereal Glimmershard', 'Firm Arrowhead', 'Fungal Spores',
  'Old Handguard', "Recruit's Insignia", 'Slime Condensate', 'Spectral Husk', 'Tattered Warrant', 'Treasure Hoarder Insignia', 'Whopperflower Nectar',
];
export const BOSS_DROPS = [
  'Accreted Growth', 'Artificed Spare Clockwork Component - Coppelia', 'Artificed Spare Clockwork Component - Coppelius', 'Basalt Pillar', 'Cleansing Heart', 'Coiled Core of Life', 'Crystalline Bloom', 'Cyclic Military Kuuvahki Core', 'Dew of Repudiation',
  "Dragonheir's False Fin", "Emperor's Resolution", 'Everflame Seed', 'Evergloom Ring', "Frostnight's Glory", 'Hoarfrost Core', 'Hooked Beak of the Deep Shadow',
  'Hurricane Seed', 'Jeweled Flaming Hilt', 'Juvenile Jade', 'Light Guiding Tetrahedron', 'Lightbearing Scale-Feather', 'Lightning Prism', 'Marionette Core',
  'Mistshroud Helmet', 'Perpetual Caliber', 'Perpetual Heart', 'Plume of the Fallen Watcher', 'Prismatic Severed Tail', 'Pseudo-Stamens', 'Quelled Creeper',
  'Radiant Antler', 'Radiant Exoskeleton', 'Remnant of the Dreadwing', 'Riftborn Regalia', 'Runic Fang', 'Severed Tail of the Sky Roamer',
  'Shattered Stability Anchor', 'Smoldering Pearl', 'Storm Beads', 'Unscorched Blossom Branch', "Vagabond's Cracked Armor",
];

/* ---------- what is still needed ---------- */

/** Cost of each ascension phase 1–6 (same for every character). Gem tier index: 0 Sliver … 3 Gemstone; mob tier: 0–2 (1–3 star). */
const ASCENSION: { mora: number; gem: [number, number]; boss: number; local: number; mob: [number, number] }[] = [
  { mora: 20000, gem: [0, 1], boss: 0, local: 3, mob: [0, 3] },
  { mora: 40000, gem: [1, 3], boss: 2, local: 10, mob: [0, 15] },
  { mora: 60000, gem: [1, 6], boss: 4, local: 20, mob: [1, 12] },
  { mora: 80000, gem: [2, 3], boss: 8, local: 30, mob: [1, 18] },
  { mora: 100000, gem: [2, 6], boss: 12, local: 45, mob: [2, 12] },
  { mora: 120000, gem: [3, 6], boss: 20, local: 60, mob: [2, 24] },
];

/** Cost of raising one talent TO level 2…10 (index 0 = level 2). */
const TALENT: { mora: number; teachings: number; guides: number; philosophies: number; weekly: number; crown: number }[] = [
  { mora: 12500, teachings: 3, guides: 0, philosophies: 0, weekly: 0, crown: 0 },
  { mora: 17500, teachings: 0, guides: 2, philosophies: 0, weekly: 0, crown: 0 },
  { mora: 25000, teachings: 0, guides: 4, philosophies: 0, weekly: 0, crown: 0 },
  { mora: 30000, teachings: 0, guides: 6, philosophies: 0, weekly: 0, crown: 0 },
  { mora: 37500, teachings: 0, guides: 9, philosophies: 0, weekly: 0, crown: 0 },
  { mora: 120000, teachings: 0, guides: 0, philosophies: 4, weekly: 1, crown: 0 },
  { mora: 260000, teachings: 0, guides: 0, philosophies: 6, weekly: 1, crown: 0 },
  { mora: 450000, teachings: 0, guides: 0, philosophies: 12, weekly: 2, crown: 0 },
  { mora: 700000, teachings: 0, guides: 0, philosophies: 16, weekly: 2, crown: 1 },
];

export interface AscensionNeeds { mora: number; gems: [number, number, number, number]; boss: number; local: number; mobs: [number, number, number] }
/** Everything still needed to go from `phase` (0–6 ascensions done) to phase 6. */
export function ascensionNeeds(phase: number): AscensionNeeds {
  const n: AscensionNeeds = { mora: 0, gems: [0, 0, 0, 0], boss: 0, local: 0, mobs: [0, 0, 0] };
  for (const s of ASCENSION.slice(Math.max(0, phase))) {
    n.mora += s.mora; n.gems[s.gem[0]] += s.gem[1]; n.boss += s.boss; n.local += s.local; n.mobs[s.mob[0]] += s.mob[1];
  }
  return n;
}

export interface TalentNeeds { mora: number; teachings: number; guides: number; philosophies: number; weekly: number; crown: number }
/** Everything still needed to bring each of the given talent levels (1–10) up to 10. */
export function talentNeeds(levels: number[]): TalentNeeds {
  const n: TalentNeeds = { mora: 0, teachings: 0, guides: 0, philosophies: 0, weekly: 0, crown: 0 };
  for (const lv of levels) for (const s of TALENT.slice(Math.max(0, lv - 1))) {
    n.mora += s.mora; n.teachings += s.teachings; n.guides += s.guides; n.philosophies += s.philosophies; n.weekly += s.weekly; n.crown += s.crown;
  }
  return n;
}
