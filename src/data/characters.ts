import type { Character, Element, Rarity, WeaponType } from '../types';

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'character';

const c = (name: string, rarity: Rarity, element: Element, weapon: WeaponType, region: string): Character => ({
  id: slugify(name), name, rarity, element, weapon, region,
});

/**
 * THE ROSTER. To add a new character, add one line here:
 *   c('Name', rarity, 'Element', 'WeaponType', 'Region')
 * (You can also add characters from inside the app with "Add character".)
 */
export const BASE_CHARACTERS: Character[] = [
  // Mondstadt
  c('Albedo', 5, 'Geo', 'Sword', 'Mondstadt'), c('Amber', 4, 'Pyro', 'Bow', 'Mondstadt'),
  c('Barbara', 4, 'Hydro', 'Catalyst', 'Mondstadt'), c('Bennett', 4, 'Pyro', 'Sword', 'Mondstadt'),
  c('Dahlia', 4, 'Hydro', 'Sword', 'Mondstadt'), c('Diluc', 5, 'Pyro', 'Claymore', 'Mondstadt'),
  c('Diona', 4, 'Cryo', 'Bow', 'Mondstadt'), c('Eula', 5, 'Cryo', 'Claymore', 'Mondstadt'),
  c('Fischl', 4, 'Electro', 'Bow', 'Mondstadt'), c('Jean', 5, 'Anemo', 'Sword', 'Mondstadt'),
  c('Kaeya', 4, 'Cryo', 'Sword', 'Mondstadt'), c('Klee', 5, 'Pyro', 'Catalyst', 'Mondstadt'),
  c('Lisa', 4, 'Electro', 'Catalyst', 'Mondstadt'), c('Mika', 4, 'Cryo', 'Polearm', 'Mondstadt'),
  c('Mona', 5, 'Hydro', 'Catalyst', 'Mondstadt'), c('Noelle', 4, 'Geo', 'Claymore', 'Mondstadt'),
  c('Razor', 4, 'Electro', 'Claymore', 'Mondstadt'), c('Rosaria', 4, 'Cryo', 'Polearm', 'Mondstadt'),
  c('Sucrose', 4, 'Anemo', 'Catalyst', 'Mondstadt'), c('Venti', 5, 'Anemo', 'Bow', 'Mondstadt'),
  // Liyue
  c('Baizhu', 5, 'Dendro', 'Catalyst', 'Liyue'), c('Beidou', 4, 'Electro', 'Claymore', 'Liyue'),
  c('Chongyun', 4, 'Cryo', 'Claymore', 'Liyue'), c('Gaming', 4, 'Pyro', 'Claymore', 'Liyue'),
  c('Ganyu', 5, 'Cryo', 'Bow', 'Liyue'), c('Hu Tao', 5, 'Pyro', 'Polearm', 'Liyue'),
  c('Keqing', 5, 'Electro', 'Sword', 'Liyue'), c('Lan Yan', 4, 'Anemo', 'Catalyst', 'Liyue'),
  c('Ningguang', 4, 'Geo', 'Catalyst', 'Liyue'), c('Qiqi', 5, 'Cryo', 'Sword', 'Liyue'),
  c('Shenhe', 5, 'Cryo', 'Polearm', 'Liyue'), c('Xiangling', 4, 'Pyro', 'Polearm', 'Liyue'),
  c('Xianyun', 5, 'Anemo', 'Catalyst', 'Liyue'), c('Xiao', 5, 'Anemo', 'Polearm', 'Liyue'),
  c('Xingqiu', 4, 'Hydro', 'Sword', 'Liyue'), c('Xinyan', 4, 'Pyro', 'Claymore', 'Liyue'),
  c('Yanfei', 4, 'Pyro', 'Catalyst', 'Liyue'), c('Yaoyao', 4, 'Dendro', 'Polearm', 'Liyue'),
  c('Yelan', 5, 'Hydro', 'Bow', 'Liyue'), c('Yun Jin', 4, 'Geo', 'Polearm', 'Liyue'),
  c('Zhongli', 5, 'Geo', 'Polearm', 'Liyue'),
  // Inazuma
  c('Arataki Itto', 5, 'Geo', 'Claymore', 'Inazuma'), c('Gorou', 4, 'Geo', 'Bow', 'Inazuma'),
  c('Kaedehara Kazuha', 5, 'Anemo', 'Sword', 'Inazuma'), c('Kamisato Ayaka', 5, 'Cryo', 'Sword', 'Inazuma'),
  c('Kamisato Ayato', 5, 'Hydro', 'Sword', 'Inazuma'), c('Kirara', 4, 'Dendro', 'Sword', 'Inazuma'),
  c('Kujou Sara', 4, 'Electro', 'Bow', 'Inazuma'), c('Kuki Shinobu', 4, 'Electro', 'Sword', 'Inazuma'),
  c('Raiden Shogun', 5, 'Electro', 'Polearm', 'Inazuma'), c('Sangonomiya Kokomi', 5, 'Hydro', 'Catalyst', 'Inazuma'),
  c('Sayu', 4, 'Anemo', 'Claymore', 'Inazuma'), c('Shikanoin Heizou', 4, 'Anemo', 'Catalyst', 'Inazuma'),
  c('Thoma', 4, 'Pyro', 'Polearm', 'Inazuma'), c('Yae Miko', 5, 'Electro', 'Catalyst', 'Inazuma'),
  c('Yoimiya', 5, 'Pyro', 'Bow', 'Inazuma'), c('Yumemizuki Mizuki', 5, 'Anemo', 'Catalyst', 'Inazuma'),
  // Sumeru
  c('Alhaitham', 5, 'Dendro', 'Sword', 'Sumeru'), c('Candace', 4, 'Hydro', 'Polearm', 'Sumeru'),
  c('Collei', 4, 'Dendro', 'Bow', 'Sumeru'), c('Cyno', 5, 'Electro', 'Polearm', 'Sumeru'),
  c('Dehya', 5, 'Pyro', 'Claymore', 'Sumeru'), c('Dori', 4, 'Electro', 'Claymore', 'Sumeru'),
  c('Faruzan', 4, 'Anemo', 'Bow', 'Sumeru'), c('Kaveh', 4, 'Dendro', 'Claymore', 'Sumeru'),
  c('Layla', 4, 'Cryo', 'Sword', 'Sumeru'), c('Nahida', 5, 'Dendro', 'Catalyst', 'Sumeru'),
  c('Nilou', 5, 'Hydro', 'Sword', 'Sumeru'), c('Sethos', 4, 'Electro', 'Bow', 'Sumeru'),
  c('Tighnari', 5, 'Dendro', 'Bow', 'Sumeru'), c('Wanderer', 5, 'Anemo', 'Catalyst', 'Sumeru'),
  // Fontaine
  c('Charlotte', 4, 'Cryo', 'Catalyst', 'Fontaine'), c('Chevreuse', 4, 'Pyro', 'Polearm', 'Fontaine'),
  c('Clorinde', 5, 'Electro', 'Sword', 'Fontaine'), c('Emilie', 5, 'Dendro', 'Polearm', 'Fontaine'),
  c('Escoffier', 5, 'Cryo', 'Polearm', 'Fontaine'), c('Freminet', 4, 'Cryo', 'Claymore', 'Fontaine'),
  c('Furina', 5, 'Hydro', 'Sword', 'Fontaine'), c('Lynette', 4, 'Anemo', 'Sword', 'Fontaine'),
  c('Lyney', 5, 'Pyro', 'Bow', 'Fontaine'), c('Navia', 5, 'Geo', 'Claymore', 'Fontaine'),
  c('Neuvillette', 5, 'Hydro', 'Catalyst', 'Fontaine'), c('Sigewinne', 5, 'Hydro', 'Bow', 'Fontaine'),
  c('Wriothesley', 5, 'Cryo', 'Catalyst', 'Fontaine'),
  // Natlan & beyond
  c('Aino', 4, 'Hydro', 'Claymore', 'Nod-Krai'), c('Chasca', 5, 'Anemo', 'Bow', 'Natlan'),
  c('Citlali', 5, 'Cryo', 'Catalyst', 'Natlan'), c('Flins', 5, 'Electro', 'Polearm', 'Nod-Krai'),
  c('Iansan', 4, 'Electro', 'Polearm', 'Natlan'), c('Ifa', 4, 'Anemo', 'Catalyst', 'Natlan'),
  c('Ineffa', 5, 'Electro', 'Polearm', 'Nod-Krai'), c('Kachina', 4, 'Geo', 'Polearm', 'Natlan'),
  c('Kinich', 5, 'Dendro', 'Claymore', 'Natlan'), c('Lauma', 5, 'Dendro', 'Catalyst', 'Nod-Krai'),
  c('Mavuika', 5, 'Pyro', 'Claymore', 'Natlan'), c('Mualani', 5, 'Hydro', 'Catalyst', 'Natlan'),
  c('Ororon', 4, 'Electro', 'Bow', 'Natlan'), c('Skirk', 5, 'Cryo', 'Sword', 'Unknown'),
  c('Varesa', 5, 'Electro', 'Catalyst', 'Natlan'), c('Xilonen', 5, 'Geo', 'Sword', 'Natlan'),
  // Nod-Krai & other Luna-era additions (6.x)
  c('Columbina', 5, 'Hydro', 'Catalyst', 'Nod-Krai'), c('Illuga', 4, 'Geo', 'Polearm', 'Nod-Krai'),
  c('Jahoda', 4, 'Anemo', 'Bow', 'Nod-Krai'), c('Linnea', 5, 'Geo', 'Bow', 'Nod-Krai'),
  c('Nefer', 5, 'Dendro', 'Catalyst', 'Nod-Krai'), c('Prune', 4, 'Anemo', 'Catalyst', 'Nod-Krai'),
  c('Durin', 5, 'Pyro', 'Sword', 'Mondstadt'), c('Varka', 5, 'Anemo', 'Claymore', 'Mondstadt'),
  c('Lohen', 5, 'Cryo', 'Polearm', 'Mondstadt'), c('Nicole', 5, 'Pyro', 'Catalyst', 'Mondstadt'),
  c('Zibai', 5, 'Geo', 'Sword', 'Liyue'), c('Chiori', 5, 'Geo', 'Sword', 'Inazuma'),
  c('Arlecchino', 5, 'Pyro', 'Polearm', 'Fontaine'),
  // Snezhnaya (7.x) and Fatui
  c('Tartaglia', 5, 'Hydro', 'Bow', 'Snezhnaya'), c('Sandrone', 5, 'Cryo', 'Claymore', 'Snezhnaya'),
  c('Odette', 5, 'Cryo', 'Sword', 'Snezhnaya'), c('Alyosha', 4, 'Electro', 'Polearm', 'Snezhnaya'),
  c('Vesna', 5, 'Anemo', 'Sword', 'Snezhnaya'), c('Vodyanitsa', 5, 'Hydro', 'Catalyst', 'Snezhnaya'),
  c('Mitya', 5, 'Electro', 'Catalyst', 'Snezhnaya'), c('Valeriy', 4, 'Electro', 'Sword', 'Snezhnaya'),
  // Outlanders (not part of any nation)
  c('Traveler', 5, 'Anemo', 'Sword', 'Unknown'), c('Aloy', 5, 'Cryo', 'Bow', 'Unknown'),
];
