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

/** Source: game8.co artifact list (Version 7.x). 5-star, then 4-star, then 3-star sets. */
export const ARTIFACT_SETS = [
  // 5-star
  'A Day Carved from Rising Winds', 'Archaic Petra', 'Aubade of Morningstar and Moon', 'Blizzard Strayer',
  'Bloodstained Chivalry', 'Celestial Gift', 'Crimson Witch of Flames', 'Deepwood Memories',
  'Desert Pavilion Chronicle', 'Disenchantment in Deep Shadows', 'Echoes of an Offering', 'Emblem of Severed Fate',
  'Finale of the Deep Galleries', 'Flower of Paradise Lost', 'Fragment of Harmonic Whimsy', 'Gilded Dreams',
  "Gladiator's Finale", 'Golden Troupe', 'Heart of Depth', 'Heart of the Furnace', 'Husk of Opulent Dreams',
  'Lavawalker', "Long Night's Oath", 'Maiden Beloved', 'Marechaussee Hunter', "Night of the Sky's Unveiling",
  'Nighttime Whispers in the Echoing Woods', 'Noblesse Oblige', "Nymph's Dream", 'Obsidian Codex', 'Ocean-Hued Clam',
  'Pale Flame', 'Retracing Bolide', 'Scarlet Proof', 'Scroll of the Hero of Cinder City', "Shimenawa's Reminiscence",
  "Silken Moon's Serenade", 'Song of Days Past', 'Tenacity of the Millelith', 'Thundering Fury', 'Thundersoother',
  'Unfinished Reverie', 'Vermillion Hereafter', 'Viridescent Venerer', "Vourukasha's Glow", "Wanderer's Troupe",
  // 4-star
  'Berserker', 'Brave Heart', "Defender's Will", 'Gambler', 'Instructor', 'Martial Artist', 'Prayers for Destiny',
  'Prayers for Illumination', 'Prayers for Wisdom', 'Prayers to Springtime', 'Resolution of Sojourner', 'Scholar',
  'The Exile', 'Tiny Miracle',
  // 3-star
  'Adventurer', 'Lucky Dog', 'Traveling Doctor',
];

/** Source: game8.co weapon lists (5-star and 4-star, Version 7.1). Suggestions only: any weapon name can be typed in. */
export const WEAPON_NAMES: Record<WeaponType, string[]> = {
  Sword: [
    'Absolution', 'Aquila Favonia', 'Athame Artis', 'Azurelight', 'Beyond the Chrysalis', 'Exaiphanes Blade',
    'Freedom-Sworn', 'Haran Geppaku Futsu', 'Key of Khaj-Nisut', 'Light of Foliar Incision', 'Lightbearing Moonshard',
    'Mistsplitter Reforged', 'Peak Patrol Song', 'Primordial Jade Cutter', 'Skyward Blade',
    'Splendor of Tranquil Waters', 'Summit Shaper', 'Uraku Misugiri', 'Whitelake Frostfeather',
    'Amenoma Kageuchi', 'Blackcliff Longsword', 'Calamity of Eshu', 'Cinnabar Spindle', 'Emberwell', 'Favonius Sword',
    'Festering Desire', 'Finale of the Deep', 'Fleuve Cendre Ferryman', 'Flute of Ezpitzal', "Heretic's Molten Blade",
    'Iron Sting', 'Kagotsurube Isshin', "Lion's Roar", "Moonweaver's Dawn", 'New Bough', 'Prototype Rancour',
    'Royal Longsword', 'Sacrificial Sword', 'Sapwood Blade', "Serenity's Call", 'Silver Light', 'Sturdy Bone',
    'Sword of Descension', 'Sword of Narzissenkreuz', 'The Alley Flash', 'The Black Sword',
    "The Dockhand's Assistant", 'The Flute', 'Toukabou Shigure', 'Wolf-Fang', "Xiphos' Moonlight",
  ],
  Claymore: [
    'A Teaspoon of Transcendence', 'A Thousand Blazing Suns', 'Beacon of the Reed Sea', 'Fang of the Mountain King',
    'Gest of the Mighty Wolf', 'Redhorn Stonethresher', 'Skyward Pride', 'Song of Broken Pines', 'The Unforged',
    'Verdict', "Wolf's Gravestone",
    'Akuoumaru', 'Blackcliff Slasher', 'Blade of Atonement', 'Earth Shaker', 'Favonius Greatsword',
    'Flame-Forged Insight', 'Forest Regalia', 'Forged by the Golden Melody', 'Fruitful Hook',
    'Katsuragikiri Nagamasa', 'Lithic Blade', 'Luxurious Sea-Lord', 'Mailed Flower', 'Makhaira Aquamarine',
    'Master Key', 'Portable Power Saw', 'Prototype Archaic', 'Rainslasher', 'Royal Greatsword',
    'Sacrificial Greatsword', 'Serpent Spine', 'Snow-Tombed Starsilver', 'Talking Stick', 'The Bell', 'Tidal Shadow',
    "Ultimate Overlord's Mega Magic Sword", 'Whiteblind',
  ],
  Polearm: [
    'Bloodsoaked Ruins', 'Calamity Queller', "Crimson Moon's Semblance", 'Disaster and Remorse',
    'Engulfing Lightning', 'Fractured Halo', 'Lumidouce Elegy', 'Primordial Jade Winged-Spear', 'Skyward Spine',
    'Staff of Homa', 'Staff of the Scarlet Sands', 'Symphonist of Scents', 'Vortex Vanquisher',
    'Ballad of the Fjords', 'Blackcliff Pole', 'Crescent Pike', 'Deathmatch', 'Dialogues of the Desert Sages',
    "Dragon's Bane", 'Dragonspine Spear', 'Favonius Lance', 'Footprint of the Rainbow', 'Frostbreath',
    'Kitain Cross Spear', 'Lithic Spear', 'Missive Windspear', 'Moonpiercer', 'Mountain-Bracing Bolt',
    "Prospector's Drill", "Prospector's Shovel", 'Prototype Starglitter', 'Rightful Reward', 'Royal Spear',
    "Sacrificer's Staff", 'Song of the Vigil', 'Tamayuratei no Ohanashi', 'The Catch', "Wavebreaker's Fin",
  ],
  Bow: [
    "Amos' Bow", 'Aqua Simulacra', "Astral Vulture's Crimson Plumage", 'Elegy for the End', 'Golden Frostbound Oath',
    "Hunter's Path", 'Polar Star', 'Silvershower Heartstrings', 'Skyward Harp', 'The Daybreak Chronicles',
    'The First Great Magic', 'Thundering Pulse',
    'Alley Hunter', 'Blackcliff Warbow', 'Breezeborne Refrain', 'Chain Breaker', 'Cloudforged', 'Compound Bow',
    'Covenant of Frost and Snow', 'End of the Line', 'Fading Twilight', 'Favonius Warbow', 'Flower-Wreathed Feathers',
    'Hamayumi', 'Ibis Piercer', 'Jade Vista', "King's Squire", 'Mitternachts Waltz', "Mouun's Moon", 'Predator',
    'Prototype Crescent', "Rainbow Serpent's Rain Bow", 'Range Gauge', 'Royal Bow', 'Rust', 'Sacrificial Bow',
    'Scion of the Blazing Sun', 'Sequence of Solitude', 'Snare Hook', 'Song of Stillness', 'The Stringless',
    'The Viridescent Hunt', 'Windblume Ode',
  ],
  Catalyst: [
    'A Thousand Floating Dreams', "Angelos' Heptades", 'Cashflow Supervision', "Crane's Echoing Call",
    'Everlasting Moonglow', 'Hymn of the Maelstrom', "Jadefall's Splendor", "Kagura's Verity",
    'Lost Prayer to the Sacred Winds', 'Memory of Dust', "Nightweaver's Looking Glass", "Nocturne's Curtain Call",
    'Reliquary of Truth', 'Skyward Atlas', "Starcaller's Watch", 'Sunny Morning Sleep-In', "Surf's Up",
    'Tome of the Eternal Flow', "Tulaytullah's Remembrance", 'Vivid Notions',
    'Ash-Graven Drinking Horn', 'Ballad of the Boundless Blue', 'Blackcliff Agate', 'Blackmarrow Lantern',
    'Clash of Kings', 'Dawning Frost', 'Dodoco Tales', 'Echoes of the Heart', 'Etherlight Spindlelute',
    'Eye of Perception', 'Favonius Codex', 'Flowing Purity', 'Frostbearer', 'Fruit of Fulfillment', 'Hakushin Ring',
    'Mappa Mare', 'Oathsworn Eye', 'Prototype Amber', 'Ring of Yaxche', 'Royal Grimoire', 'Sacrificial Fragments',
    'Sacrificial Jade', 'Solar Pearl', 'The Widsith', 'Wandering Evenstar', 'Waveriding Whirl', 'Wine and Song',
    "Winter's Heavy Heart",
  ],
};
