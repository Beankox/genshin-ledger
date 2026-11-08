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

const ival = (m: any, key: string) => Number(m?.[key]?.ival ?? m?.[key]?.val ?? NaN);

/**
 * `data` is the response of https://enka.network/api/uid/<uid>.
 * `store` is Enka's characters.json (used to find which skill is the normal attack / skill / burst). It may be null.
 * Only characters on the player's in-game Character Showcase are in the response.
 */
export function parseEnka(data: any, store: Record<string, any> | null): ParseResult {
  const items: Imported[] = [], unknown: string[] = [];
  for (const a of Array.isArray(data?.avatarInfoList) ? data.avatarInfoList : []) {
    const id = ENKA_IDS[String(a?.avatarId)];
    if (!id) { unknown.push(`Character #${a?.avatarId}`); continue; }
    const level = ival(a.propMap, '4001');
    if (!Number.isFinite(level)) continue;
    const asc = ival(a.propMap, '1002');
    const entry = store?.[`${a.avatarId}-${a.skillDepotId}`] ?? store?.[String(a.avatarId)];
    const order: unknown = entry?.SkillOrder;
    const lv = (sid: unknown) => clamp(Number(a.skillLevelMap?.[String(sid)] ?? 1), 1, 10);
    const talents = Array.isArray(order) && order.length >= 3 ? ([lv(order[0]), lv(order[1]), lv(order[2])] as [number, number, number]) : undefined;
    const fr = Number(a.fetterInfo?.expLevel);
    items.push({
      id, level: clamp(level, 1, 90), ascension: clamp(asc, 0, 6),
      constellation: clamp(Array.isArray(a.talentIdList) ? a.talentIdList.length : 0, 0, 6),
      talents, friendship: Number.isFinite(fr) && fr > 0 ? clamp(fr, 1, 10) : undefined,
    });
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
