import type { ArtifactPiece, SlotKey } from '../types';
import { ARTIFACT_SETS, SLOTS, WEAPON_NAMES } from '../data/constants';
import { clamp } from './ledger';

/** One character read from the game (UID import) or from a scanner file. */
export interface Imported {
  id: string;
  level: number;
  ascension: number;
  constellation: number;
  talents?: [number, number, number];
  friendship?: number;
  weapon?: { name: string; level: number; refinement: number };
  artifacts?: Partial<Record<SlotKey, ArtifactPiece>>;
}
export interface ParseResult { items: Imported[]; unknown: string[] }

/* ---------------- Enka.Network (UID) ---------------- */

/** Enka avatarId -> this app's character id. */
const ENKA_IDS: Record<string, string> = {
  10000002: 'kamisato-ayaka', 10000003: 'jean', 10000005: 'traveler', 10000007: 'traveler', 10000006: 'lisa', 10000014: 'barbara',
  10000015: 'kaeya', 10000016: 'diluc', 10000020: 'razor', 10000021: 'amber', 10000022: 'venti', 10000023: 'xiangling',
  10000024: 'beidou', 10000025: 'xingqiu', 10000026: 'xiao', 10000027: 'ningguang', 10000029: 'klee', 10000030: 'zhongli',
  10000031: 'fischl', 10000032: 'bennett', 10000033: 'tartaglia', 10000034: 'noelle', 10000035: 'qiqi', 10000036: 'chongyun',
  10000037: 'ganyu', 10000038: 'albedo', 10000039: 'diona', 10000041: 'mona', 10000042: 'keqing', 10000043: 'sucrose',
  10000044: 'xinyan', 10000045: 'rosaria', 10000046: 'hu-tao', 10000047: 'kaedehara-kazuha', 10000048: 'yanfei', 10000049: 'yoimiya',
  10000050: 'thoma', 10000051: 'eula', 10000052: 'raiden-shogun', 10000053: 'sayu', 10000054: 'sangonomiya-kokomi', 10000055: 'gorou',
  10000056: 'kujou-sara', 10000057: 'arataki-itto', 10000058: 'yae-miko', 10000059: 'shikanoin-heizou', 10000060: 'yelan',
  10000061: 'kirara', 10000062: 'aloy', 10000063: 'shenhe', 10000064: 'yun-jin', 10000065: 'kuki-shinobu', 10000066: 'kamisato-ayato',
  10000067: 'collei', 10000068: 'dori', 10000069: 'tighnari', 10000070: 'nilou', 10000071: 'cyno', 10000072: 'candace',
  10000073: 'nahida', 10000074: 'layla', 10000075: 'wanderer', 10000076: 'faruzan', 10000077: 'yaoyao', 10000078: 'alhaitham',
  10000079: 'dehya', 10000080: 'mika', 10000081: 'kaveh', 10000082: 'baizhu', 10000083: 'lynette', 10000084: 'lyney',
  10000085: 'freminet', 10000086: 'wriothesley', 10000087: 'neuvillette', 10000088: 'charlotte', 10000089: 'furina',
  10000090: 'chevreuse', 10000091: 'navia', 10000092: 'gaming', 10000093: 'xianyun', 10000094: 'chiori', 10000095: 'sigewinne',
  10000096: 'arlecchino', 10000097: 'sethos', 10000098: 'clorinde', 10000099: 'emilie', 10000100: 'kachina', 10000101: 'kinich',
  10000102: 'mualani', 10000103: 'xilonen', 10000104: 'chasca', 10000105: 'ororon', 10000106: 'mavuika', 10000107: 'citlali',
  10000108: 'lan-yan', 10000109: 'yumemizuki-mizuki', 10000110: 'iansan', 10000111: 'varesa', 10000112: 'escoffier', 10000113: 'ifa',
  10000114: 'skirk', 10000115: 'dahlia', 10000116: 'ineffa', 10000119: 'lauma', 10000120: 'flins', 10000121: 'aino',
  10000122: 'nefer', 10000123: 'durin', 10000124: 'jahoda',
};

const ENKA_STAT: Record<string, string> = {
  FIGHT_PROP_HP: 'HP', FIGHT_PROP_HP_PERCENT: 'HP%', FIGHT_PROP_ATTACK: 'ATK', FIGHT_PROP_ATTACK_PERCENT: 'ATK%',
  FIGHT_PROP_DEFENSE: 'DEF', FIGHT_PROP_DEFENSE_PERCENT: 'DEF%', FIGHT_PROP_ELEMENT_MASTERY: 'Elemental Mastery',
  FIGHT_PROP_CHARGE_EFFICIENCY: 'Energy Recharge%', FIGHT_PROP_CRITICAL: 'CRIT Rate%', FIGHT_PROP_CRITICAL_HURT: 'CRIT DMG%',
  FIGHT_PROP_HEAL_ADD: 'Healing Bonus%', FIGHT_PROP_PHYSICAL_ADD_HURT: 'Physical DMG%', FIGHT_PROP_FIRE_ADD_HURT: 'Pyro DMG%',
  FIGHT_PROP_WATER_ADD_HURT: 'Hydro DMG%', FIGHT_PROP_WIND_ADD_HURT: 'Anemo DMG%', FIGHT_PROP_ELEC_ADD_HURT: 'Electro DMG%',
  FIGHT_PROP_GRASS_ADD_HURT: 'Dendro DMG%', FIGHT_PROP_ICE_ADD_HURT: 'Cryo DMG%', FIGHT_PROP_ROCK_ADD_HURT: 'Geo DMG%',
};
const ENKA_SLOT: Record<string, SlotKey> = {
  EQUIP_BRACER: 'flower', EQUIP_NECKLACE: 'plume', EQUIP_SHOES: 'sands', EQUIP_RING: 'goblet', EQUIP_DRESS: 'circlet',
};
const enkaValue = (stat: string, v: unknown) => { const n = Number(v); return Number.isFinite(n) ? String(stat.endsWith('%') ? Math.round(n * 10) / 10 : Math.round(n)) : ''; };

/** Name hashes of the weapons and artifact sets in an Enka response (to be turned into names). */
export function collectHashes(data: any): string[] {
  const out = new Set<string>();
  for (const a of Array.isArray(data?.avatarInfoList) ? data.avatarInfoList : [])
    for (const e of Array.isArray(a?.equipList) ? a.equipList : []) {
      if (e?.flat?.itemType === 'ITEM_WEAPON' && e.flat.nameTextMapHash) out.add(String(e.flat.nameTextMapHash));
      if (e?.flat?.itemType === 'ITEM_RELIQUARY' && e.flat.setNameTextMapHash) out.add(String(e.flat.setNameTextMapHash));
    }
  return [...out];
}

const ival = (m: any, key: string) => Number(m?.[key]?.ival ?? m?.[key]?.val ?? NaN);

/**
 * `data` is the response of https://enka.network/api/uid/<uid>.
 * `store` is Enka's characters.json (used to find which skill is the normal attack / skill / burst). It may be null.
 * Only characters on the player's in-game Character Showcase are in the response.
 */
export function parseEnka(
  data: any, store: Record<string, any> | null, names?: Record<string, string> | null, extraIds?: Record<string, string>,
): ParseResult {
  const items: Imported[] = [], unknown: string[] = [];
  for (const a of Array.isArray(data?.avatarInfoList) ? data.avatarInfoList : []) {
    // Characters newer than this app's list come back as "enka:<avatarId>"; the Import page lets the player say who they are.
    const id = ENKA_IDS[String(a?.avatarId)] ?? extraIds?.[String(a?.avatarId)] ?? `enka:${a?.avatarId}`;
    const level = ival(a.propMap, '4001');
    if (!Number.isFinite(level)) continue;
    const asc = ival(a.propMap, '1002');
    const entry = store?.[`${a.avatarId}-${a.skillDepotId}`] ?? store?.[String(a.avatarId)];
    const order: unknown = entry?.SkillOrder;
    const lv = (sid: unknown) => clamp(Number(a.skillLevelMap?.[String(sid)] ?? 1), 1, 10);
    // Enka's character list is out of date for the newest characters; then the three skills in ascending id order are normal / skill / burst.
    const skillIds = Object.keys(a.skillLevelMap ?? {}).map(Number).sort((x, y) => x - y);
    const talents = Array.isArray(order) && order.length >= 3
      ? ([lv(order[0]), lv(order[1]), lv(order[2])] as [number, number, number])
      : skillIds.length === 3 ? ([lv(skillIds[0]), lv(skillIds[1]), lv(skillIds[2])] as [number, number, number]) : undefined;
    const fr = Number(a.fetterInfo?.expLevel);
    const item: Imported = {
      id, level: clamp(level, 1, 90), ascension: clamp(asc, 0, 6),
      constellation: clamp(Array.isArray(a.talentIdList) ? a.talentIdList.length : 0, 0, 6),
      talents, friendship: Number.isFinite(fr) && fr > 0 ? clamp(fr, 1, 10) : undefined,
    };
    // weapon and artifacts (names need the lookup; without it nothing is imported here, so saved builds are never blanked)
    const pieces: Partial<Record<SlotKey, ArtifactPiece>> = {};
    for (const e of names && Array.isArray(a.equipList) ? a.equipList : []) {
      const f = e?.flat;
      if (f?.itemType === 'ITEM_WEAPON' && e.weapon) {
        const name = names?.[String(f.nameTextMapHash)];
        if (name) {
          const aff = Object.values(e.weapon.affixMap ?? {})[0];
          item.weapon = { name, level: clamp(Number(e.weapon.level ?? 1), 1, 90), refinement: clamp(Number(aff ?? 0) + 1, 1, 5) };
        }
      } else if (f?.itemType === 'ITEM_RELIQUARY') {
        const slot = ENKA_SLOT[f.equipType];
        if (!slot) continue;
        const mainStat = ENKA_STAT[f.reliquaryMainstat?.mainPropId] ?? '';
        const subs = (Array.isArray(f.reliquarySubstats) ? f.reliquarySubstats : []).slice(0, 4).map((x: any) => {
          const stat = ENKA_STAT[x?.appendPropId] ?? '';
          return { stat, value: stat ? enkaValue(stat, x.statValue) : '' };
        });
        while (subs.length < 4) subs.push({ stat: '', value: '' });
        pieces[slot] = { set: names?.[String(f.setNameTextMapHash)] ?? '', main: mainStat, subs };
      }
    }
    if (Object.keys(pieces).length) item.artifacts = pieces;
    items.push(item);
  }
  return { items, unknown };
}

/* ---------------- GOOD scanner files (Genshin Optimizer format) ---------------- */

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const pretty = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
const STAT: Record<string, string> = {
  hp: 'HP', hp_: 'HP%', atk: 'ATK', atk_: 'ATK%', def: 'DEF', def_: 'DEF%', eleMas: 'Elemental Mastery', enerRech_: 'Energy Recharge%',
  critRate_: 'CRIT Rate%', critDMG_: 'CRIT DMG%', heal_: 'Healing Bonus%', physical_dmg_: 'Physical DMG%',
  pyro_dmg_: 'Pyro DMG%', hydro_dmg_: 'Hydro DMG%', anemo_dmg_: 'Anemo DMG%', electro_dmg_: 'Electro DMG%',
  dendro_dmg_: 'Dendro DMG%', cryo_dmg_: 'Cryo DMG%', geo_dmg_: 'Geo DMG%',
};
const statValue = (key: string, v: unknown) => { const n = Number(v); return Number.isFinite(n) ? String(key.endsWith('_') ? Math.round(n * 10) / 10 : Math.round(n)) : ''; };
const ALL_WEAPONS = Object.values(WEAPON_NAMES).flat();
const nameFrom = (key: string, list: string[]) => list.find((n) => norm(n) === norm(key)) ?? pretty(key);

export function parseGood(data: any, roster: { id: string; name: string }[]): ParseResult {
  const items: Imported[] = [], unknown: string[] = [];
  const idOf = (key: string) => roster.find((c) => norm(c.name) === norm(key))?.id ?? (norm(key).startsWith('traveler') ? 'traveler' : undefined);
  const weapons: any[] = Array.isArray(data?.weapons) ? data.weapons : [];
  const arts: any[] = Array.isArray(data?.artifacts) ? data.artifacts : [];
  const slotKeys = SLOTS.map((s) => s.key) as string[];

  for (const c of Array.isArray(data?.characters) ? data.characters : []) {
    const key = String(c?.key ?? '');
    const id = idOf(key);
    if (!id) { if (key) unknown.push(pretty(key)); continue; }
    if (items.some((i) => i.id === id)) continue; // e.g. several Traveler elements: keep the first
    const t = c.talent ?? {};
    const item: Imported = {
      id, level: clamp(Number(c.level ?? 1), 1, 90), ascension: clamp(Number(c.ascension ?? 0), 0, 6),
      constellation: clamp(Number(c.constellation ?? 0), 0, 6),
      talents: t.auto || t.skill || t.burst ? [clamp(Number(t.auto ?? 1), 1, 10), clamp(Number(t.skill ?? 1), 1, 10), clamp(Number(t.burst ?? 1), 1, 10)] : undefined,
    };
    const w = weapons.find((x) => x?.location === key);
    if (w?.key) item.weapon = { name: nameFrom(String(w.key), ALL_WEAPONS), level: clamp(Number(w.level ?? 1), 1, 90), refinement: clamp(Number(w.refinement ?? 1), 1, 5) };
    const pieces: Partial<Record<SlotKey, ArtifactPiece>> = {};
    for (const a of arts) {
      if (a?.location !== key || !slotKeys.includes(a.slotKey)) continue;
      const subs = (Array.isArray(a.substats) ? a.substats : []).slice(0, 4).map((s: any) => ({ stat: STAT[s?.key] ?? '', value: STAT[s?.key] ? statValue(s.key, s.value) : '' }));
      while (subs.length < 4) subs.push({ stat: '', value: '' });
      pieces[a.slotKey as SlotKey] = { set: nameFrom(String(a.setKey ?? ''), ARTIFACT_SETS), main: STAT[a.mainStatKey] ?? '', subs };
    }
    if (Object.keys(pieces).length) item.artifacts = pieces;
    items.push(item);
  }
  return { items, unknown };
}

/* ---------------- HoYoLAB (full roster) ---------------- */

const HOYO_SLOT: Record<number, SlotKey> = { 1: 'flower', 2: 'plume', 3: 'sands', 4: 'goblet', 5: 'circlet' };
const hoyoStat = (name: unknown, value: unknown): string => {
  const n = norm(String(name ?? '')), pct = String(value ?? '').includes('%');
  if (n === 'hp') return pct ? 'HP%' : 'HP';
  if (n === 'atk') return pct ? 'ATK%' : 'ATK';
  if (n === 'def') return pct ? 'DEF%' : 'DEF';
  if (n === 'elementalmastery') return 'Elemental Mastery';
  if (n.startsWith('energyrecharge')) return 'Energy Recharge%';
  if (n.startsWith('critrate')) return 'CRIT Rate%';
  if (n.startsWith('critdmg')) return 'CRIT DMG%';
  if (n.startsWith('healingbonus')) return 'Healing Bonus%';
  const el = n.match(/^(physical|pyro|hydro|anemo|electro|dendro|cryo|geo)dmg/);
  return el ? `${el[1][0].toUpperCase()}${el[1].slice(1)} DMG%` : '';
};
const hoyoNum = (stat: string, v: unknown) => { const n = parseFloat(String(v ?? '').replace(/[^0-9.]/g, '')); return Number.isFinite(n) ? String(stat.endsWith('%') ? Math.round(n * 10) / 10 : Math.round(n)) : ''; };

/** `data` is the Worker's /roster response (HoYoLAB character list). */
export function parseHoyolab(data: any, extraIds?: Record<string, string>): ParseResult {
  const items: Imported[] = [], unknown: string[] = [];
  for (const c of Array.isArray(data?.data?.list) ? data.data.list : []) {
    const b = c?.base ?? {};
    const id = ENKA_IDS[String(b.id)] ?? extraIds?.[String(b.id)] ?? `enka:${b.id}`;
    const level = Number(b.level);
    if (!Number.isFinite(level)) continue;
    if (items.some((i) => i.id === id)) continue;
    const active = (Array.isArray(c.skills) ? c.skills : []).filter((s: any) => s?.skill_type === 1).slice(0, 3);
    const item: Imported = {
      id, level: clamp(level, 1, 90), ascension: clamp(Math.max(0, Math.ceil((level - 20) / 10)), 0, 6),
      constellation: clamp(Number(b.actived_constellation_num ?? 0), 0, 6),
      talents: active.length === 3 ? (active.map((s: any) => clamp(Number(s.level ?? 1), 1, 10)) as [number, number, number]) : undefined,
      friendship: Number(b.fetter) > 0 ? clamp(Number(b.fetter), 1, 10) : undefined,
    };
    if (c.weapon?.name) item.weapon = { name: String(c.weapon.name), level: clamp(Number(c.weapon.level ?? 1), 1, 90), refinement: clamp(Number(c.weapon.affix_level ?? 1), 1, 5) };
    const pieces: Partial<Record<SlotKey, ArtifactPiece>> = {};
    for (const r of Array.isArray(c.relics) ? c.relics : []) {
      const slot = HOYO_SLOT[Number(r?.pos)];
      if (!slot) continue;
      const main = hoyoStat(r.main_property?.name, r.main_property?.value);
      const subs = (Array.isArray(r.sub_property_list) ? r.sub_property_list : []).slice(0, 4).map((x: any) => {
        const stat = hoyoStat(x?.name, x?.value);
        return { stat, value: stat ? hoyoNum(stat, x.value) : '' };
      });
      while (subs.length < 4) subs.push({ stat: '', value: '' });
      pieces[slot] = { set: String(r.set?.name ?? ''), main, subs };
    }
    if (Object.keys(pieces).length) item.artifacts = pieces;
    items.push(item);
  }
  return { items, unknown };
}
