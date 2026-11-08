import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Ledger } from '../hooks/useLedger';
import type { Character } from '../types';
import { ELEMENTS, WEAPON_TYPES } from '../data/constants';
import { CharacterCard } from '../components/CharacterCard';
import { CharacterForm } from '../components/CharacterForm';
import { EmptyState } from '../components/Controls';

export type Mode = 'all' | 'owned' | 'unowned';
const TITLES: Record<Mode, string> = { all: 'All characters', owned: 'Owned characters', unowned: 'Unowned characters' };
const NONE = { q: '', element: '', weapon: '', rarity: '', region: '', sort: 'name' };

let remembered = NONE; // kept while you move between All / Owned / Unowned

export function Collection({ ledger, mode }: { ledger: Ledger; mode: Mode }) {
  const { characters, progressOf, patchProgress, saveCharacter } = ledger;
  const [f, setFilters] = useState(remembered);
  const setF = (next: typeof NONE) => { remembered = next; setFilters(next); };
  const [adding, setAdding] = useState(false);
  const set = (k: keyof typeof NONE) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const regions = useMemo(() => [...new Set(characters.map((c) => c.region))].sort(), [characters]);
  const filtered = f.q || f.element || f.weapon || f.rarity || f.region;

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const lv = (c: Character) => { const p = progressOf(c.id); return p.owned ? p.level : 0; };
    const sorters: Record<string, (a: Character, b: Character) => number> = {
      name: (a, b) => a.name.localeCompare(b.name),
      'name-desc': (a, b) => b.name.localeCompare(a.name),
      level: (a, b) => lv(b) - lv(a) || a.name.localeCompare(b.name),
      rarity: (a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name),
      recent: (a, b) => (progressOf(b.id).updatedAt ?? 0) - (progressOf(a.id).updatedAt ?? 0),
    };
    return characters
      .filter((c) => mode === 'all' || (mode === 'owned') === progressOf(c.id).owned)
      .filter((c) => c.name.toLowerCase().includes(q) && (!f.element || c.element === f.element) && (!f.weapon || c.weapon === f.weapon)
        && (!f.rarity || c.rarity === Number(f.rarity)) && (!f.region || c.region === f.region))
      .sort(sorters[f.sort]);
  }, [characters, progressOf, f, mode]);

  const sel = (k: keyof typeof NONE, label: string, opts: string[]) => (
    <select aria-label={label} value={f[k]} onChange={set(k)}><option value="">{label}</option>{opts.map((o) => <option key={o} value={o}>{o}</option>)}</select>
  );

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>{TITLES[mode]}</h1><p className="lead">{list.length} shown{filtered ? ' with filters' : ''}. Select a character to open their profile.</p></div>
        <button className="btn primary" onClick={() => setAdding(true)}><Plus size={16} /> Add character</button>
      </div>

      <div className="tools">
        <label className="search"><Search size={16} /><input type="search" aria-label="Search by name" placeholder="Search by name" value={f.q} onChange={set('q')} /></label>
        {sel('element', 'Element', ELEMENTS)}{sel('weapon', 'Weapon', WEAPON_TYPES)}{sel('rarity', 'Rarity', ['5', '4'])}{sel('region', 'Region', regions)}
        <select aria-label="Sort by" value={f.sort} onChange={set('sort')}>
          <option value="name">Sort: A to Z</option><option value="name-desc">Sort: Z to A</option><option value="level">Sort: Level</option>
          <option value="rarity">Sort: Rarity</option><option value="recent">Sort: Recently modified</option>
        </select>
      </div>

      {list.length ? (
        <div className="grid">
          {list.map((c) => <CharacterCard key={c.id} character={c} progress={progressOf(c.id)} onToggleOwned={() => patchProgress(c.id, (p) => ({ ...p, owned: !p.owned }))} />)}
        </div>
      ) : filtered ? (
        <EmptyState title="No characters match these filters" hint="Try a different name or remove a filter." action={<button className="btn" onClick={() => setF(NONE)}>Clear filters</button>} />
      ) : mode === 'owned' ? (
        <EmptyState title="No owned characters yet" hint="Use the + button on any character card to add it to your collection." action={<a className="btn" href="#/characters">Browse all characters</a>} />
      ) : (
        <EmptyState title="Everyone is accounted for" hint="Every character in the ledger is marked as owned." />
      )}

      {adding && <CharacterForm existingIds={new Set(characters.map((c) => c.id))} regions={regions} onSave={saveCharacter} onClose={() => setAdding(false)} />}
    </div>
  );
}
