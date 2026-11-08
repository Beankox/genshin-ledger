import { describe, expect, it } from 'vitest';
import { ASC_CAPS, clamp, diffOverride, emptyProgress, emptyState, normalizeProgress, normalizeState, requiredAscension } from './ledger';
import type { Character } from '../types';

describe('clamp', () => {
  it('limits and rounds', () => { expect(clamp(95, 1, 90)).toBe(90); expect(clamp(-3, 1, 90)).toBe(1); expect(clamp(4.6, 1, 10)).toBe(5); });
  it('handles NaN', () => expect(clamp(NaN, 1, 10)).toBe(1));
});

describe('requiredAscension', () => {
  it.each([[1, 0], [20, 0], [21, 1], [40, 1], [41, 2], [80, 5], [81, 6], [90, 6]])('level %i needs phase %i', (lv, a) => {
    expect(requiredAscension(lv)).toBe(a);
  });
  it('is never above the cap table', () => { for (let lv = 1; lv <= 90; lv++) expect(ASC_CAPS[requiredAscension(lv)]).toBeGreaterThanOrEqual(lv); });
});

describe('normalizeProgress', () => {
  it('fills defaults for garbage', () => expect(normalizeProgress(null)).toEqual(emptyProgress()));
  it('clamps values and fixes ascension', () => {
    const p = normalizeProgress({ owned: true, level: 85, ascension: 0, constellation: 9, friendship: 0, talents: [99, 'x'] });
    expect(p.level).toBe(85); expect(p.ascension).toBe(6); expect(p.constellation).toBe(6);
    expect(p.friendship).toBe(1); expect(p.talents).toEqual([10, 1, 1]);
  });
});

describe('normalizeState', () => {
  it('rejects things that are not a ledger', () => { expect(normalizeState(null)).toBeNull(); expect(normalizeState({ foo: 1 })).toBeNull(); });
  it('rejects exports from a newer version', () => expect(normalizeState({ version: 2, custom: [], progress: {} })).toBeNull());
  it('round-trips an empty state', () => expect(normalizeState(JSON.parse(JSON.stringify(emptyState())))).toEqual(emptyState()));
  it('drops invalid custom characters and keeps valid ones', () => {
    const s = normalizeState({ custom: [{ id: 'a', name: 'A', element: 'Pyro', weapon: 'Bow' }, { id: 'b', name: '', element: 'Pyro', weapon: 'Bow' }, { id: 'c', name: 'C', element: 'Fire', weapon: 'Bow' }], progress: {} });
    expect(s?.custom.map((c) => c.id)).toEqual(['a']);
  });
});

describe('diffOverride', () => {
  const base: Character = { id: 'x', name: 'X', rarity: 5, element: 'Pyro', weapon: 'Sword', region: 'Liyue' };
  it('is empty when nothing changed', () => expect(diffOverride(base, { ...base })).toEqual({}));
  it('keeps only changed fields', () => expect(diffOverride(base, { ...base, region: 'Inazuma', portrait: 'u' })).toEqual({ region: 'Inazuma', portrait: 'u' }));
});

import { ascensionNeeds, talentNeeds, gemFamilyFor } from '../data/materials';
import { GAME8_GUIDES, game8Url } from '../data/guides';
import { BASE_CHARACTERS } from '../data/characters';

describe('materials', () => {
  it('full ascension totals match the game', () => {
    const a = ascensionNeeds(0);
    expect(a.mora).toBe(420000); expect(a.gems).toEqual([1, 9, 9, 6]); expect(a.boss).toBe(46); expect(a.local).toBe(168); expect(a.mobs).toEqual([18, 30, 36]);
  });
  it('nothing is needed once fully ascended', () => { const a = ascensionNeeds(6); expect(a.mora).toBe(0); expect(a.boss).toBe(0); });
  it('one talent 1 to 10 totals match the game', () => {
    expect(talentNeeds([1])).toEqual({ mora: 1652500, teachings: 3, guides: 21, philosophies: 38, weekly: 6, crown: 1 });
  });
  it('talents already at 10 need nothing and three talents triple the cost', () => {
    expect(talentNeeds([10, 10, 10]).mora).toBe(0); expect(talentNeeds([1, 1, 1]).crown).toBe(3);
  });
  it('picks the gem family from the element', () => {
    expect(gemFamilyFor('hu-tao', 'Pyro')).toBe('Agnidus Agate'); expect(gemFamilyFor('traveler', 'Anemo')).toBe('Brilliant Diamond');
  });
  it('every guide link belongs to a roster character', () => {
    const ids = new Set(BASE_CHARACTERS.map((c) => c.id));
    for (const id of Object.keys(GAME8_GUIDES)) expect(ids.has(id)).toBe(true);
    expect(game8Url('hu-tao')).toBe('https://game8.co/games/Genshin-Impact/archives/314347'); expect(game8Url('nobody')).toBeNull();
  });
});
