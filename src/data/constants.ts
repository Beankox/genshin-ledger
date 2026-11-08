import type { Element, SlotKey, WeaponType } from '../types';

export const ELEMENTS: Element[] = ['Pyro', 'Hydro', 'Anemo', 'Electro', 'Dendro', 'Cryo', 'Geo'];
export const ELEMENT_COLORS: Record<Element, string> = {
  Pyro: '#e0603b', Hydro: '#3f8fe0', Anemo: '#2fb59c', Electro: '#9a64e0',
  Dendro: '#79b035', Cryo: '#58bde0', Geo: '#d4a22c',
};
export const WEAPON_TYPES: WeaponType[] = ['Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst'];
export const REGIONS = ['Mondstadt', 'Liyue', 'Inazuma', 'Sumeru', 'Fontaine', 'Natlan', 'Nod-Krai', 'Snezhnaya', 'Unknown'];
export const TALENT_NAMES = ['Normal Attack', 'Elemental Skill', 'Elemental Burst'] as const;

export const SLOTS: { key: SlotKey; label: string; mains: string[] }[] = [
  { key: 'flower', label: 'Flower of Life', mains: ['HP'] },
  { key: 'plume', label: 'Plume of Death', mains: ['ATK'] },
  { key: 'sands', label: 'Sands of Eon', mains: ['HP%', 'ATK%', 'DEF%', 'Energy Recharge%', 'Elemental Mastery'] },
  { key: 'goblet', label: 'Goblet of Eonothem', mains: ['HP%', 'ATK%', 'DEF%', 'Elemental Mastery', 'Pyro DMG%', 'Hydro DMG%', 'Anemo DMG%', 'Electro DMG%', 'Dendro DMG%', 'Cryo DMG%', 'Geo DMG%', 'Physical DMG%'] },
  { key: 'circlet', label: 'Circlet of Logos', mains: ['HP%', 'ATK%', 'DEF%', 'CRIT Rate%', 'CRIT DMG%', 'Healing Bonus%', 'Elemental Mastery'] },
];
export const SUBSTATS = ['HP', 'ATK', 'DEF', 'HP%', 'ATK%', 'DEF%', 'Energy Recharge%', 'Elemental Mastery', 'CRIT Rate%', 'CRIT DMG%'];

export const ARTIFACT_SETS = [
  "Gladiator's Finale", "Wanderer's Troupe", 'Noblesse Oblige', 'Bloodstained Chivalry', 'Maiden Beloved',
  'Viridescent Venerer', 'Archaic Petra', 'Retracing Bolide', 'Thundersoother', 'Thundering Fury', 'Lavawalker',
  'Crimson Witch of Flames', 'Blizzard Strayer', 'Heart of Depth', 'Tenacity of the Millelith', 'Pale Flame',
  "Shimenawa's Reminiscence", 'Emblem of Severed Fate', 'Husk of Opulent Dreams', 'Ocean-Hued Clam',
  'Vermillion Hereafter', 'Echoes of an Offering', 'Deepwood Memories', 'Gilded Dreams', 'Desert Pavilion Chronicle',
  'Flower of Paradise Lost', "Nymph's Dream", "Vourukasha's Glow", 'Marechaussee Hunter', 'Golden Troupe',
  'Song of Days Past', 'Nighttime Whispers in the Echoing Woods', 'Fragment of Harmonic Whimsy', 'Unfinished Reverie',
  'Scroll of the Hero of Cinder City', 'Obsidian Codex', 'Finale of the Deep Galleries', "Long Night's Oath",
];

/** Suggestions only: any weapon name can be typed in. */
export const WEAPON_NAMES: Record<WeaponType, string[]> = {
  Sword: ['Mistsplitter Reforged', 'Aquila Favonia', 'Primordial Jade Cutter', 'Freedom-Sworn', 'Skyward Blade', 'Splendor of Tranquil Waters', 'Haran Geppaku Futsu', 'Light of Foliar Incision', 'Key of Khaj-Nisut', 'Sacrificial Sword', 'Favonius Sword', 'The Flute', 'Iron Sting', 'Festering Desire'],
  Claymore: ["Wolf's Gravestone", 'Song of Broken Pines', 'The Unforged', 'Skyward Pride', 'Redhorn Stonethresher', 'Beacon of the Reed Sea', 'Serpent Spine', 'Favonius Greatsword', 'Sacrificial Greatsword', 'Rainslasher', 'Akuoumaru', 'Prototype Archaic'],
  Polearm: ['Staff of Homa', 'Vortex Vanquisher', 'Primordial Jade Winged-Spear', 'Engulfing Lightning', 'Calamity Queller', 'Skyward Spine', 'Crescent Pike', 'Deathmatch', 'Favonius Lance', "Dragon's Bane", 'Staff of the Scarlet Sands', 'Lithic Spear'],
  Bow: ["Amos' Bow", 'Skyward Harp', 'Elegy for the End', 'Thundering Pulse', 'Polar Star', 'Aqua Simulacra', "Hunter's Path", 'The Stringless', 'Favonius Warbow', 'Sacrificial Bow', 'Rust', "Mouun's Moon"],
  Catalyst: ['A Thousand Floating Dreams', 'Skyward Atlas', 'Lost Prayer to the Sacred Winds', "Kagura's Verity", "Tulaytullah's Remembrance", 'Everlasting Moonglow', "Jadefall's Splendor", 'Sacrificial Fragments', 'Favonius Codex', 'The Widsith', 'Mappa Mare', 'Dodoco Tales'],
};
