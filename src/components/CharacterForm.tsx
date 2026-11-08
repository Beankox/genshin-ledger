import { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import type { Character, Element, Rarity, WeaponType } from '../types';
import { ELEMENTS, REGIONS, WEAPON_TYPES } from '../data/constants';
import { slugify } from '../data/characters';
import { imageToDataUrl } from '../lib/storage';
import { Modal } from './Modal';

interface Props {
  initial?: Character;            // omit to add a new character
  existingIds: Set<string>;
  regions: string[];
  canRestore?: boolean;           // built-in character that has been edited
  onSave: (c: Character) => void;
  onRestore?: () => void;
  onClose: () => void;
}

export function CharacterForm({ initial, existingIds, regions, canRestore, onSave, onRestore, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [rarity, setRarity] = useState<Rarity>(initial?.rarity ?? 5);
  const [element, setElement] = useState<Element>(initial?.element ?? 'Pyro');
  const [weapon, setWeapon] = useState<WeaponType>(initial?.weapon ?? 'Sword');
  const [region, setRegion] = useState(initial?.region ?? 'Mondstadt');
  const [portrait, setPortrait] = useState(initial?.portrait ?? '');
  const [error, setError] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Enter a name for this character.');
    let id = initial?.id;
    if (!id) {
      const base = `custom-${slugify(name)}`; id = base;
      for (let n = 2; existingIds.has(id); n++) id = `${base}-${n}`;
    }
    onSave({ id, name: name.trim(), rarity, element, weapon, region: region.trim() || 'Unknown', portrait: portrait.trim() || undefined });
    onClose();
  };

  const upload = async (f?: File) => {
    if (!f) return;
    try { setPortrait(await imageToDataUrl(f)); setError(''); } catch (err) { setError((err as Error).message); }
  };

  return (
    <Modal title={initial ? `Edit ${initial.name}` : 'Add character'} onClose={onClose}>
      <form onSubmit={submit} className="form-grid">
        <label className="full">Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Traveler" /></label>
        <label>Rarity<select value={rarity} onChange={(e) => setRarity(Number(e.target.value) as Rarity)}><option value={5}>5 star</option><option value={4}>4 star</option></select></label>
        <label>Element<select value={element} onChange={(e) => setElement(e.target.value as Element)}>{ELEMENTS.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Weapon<select value={weapon} onChange={(e) => setWeapon(e.target.value as WeaponType)}>{WEAPON_TYPES.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Region<input list="region-list" value={region} onChange={(e) => setRegion(e.target.value)} /></label>
        <datalist id="region-list">{[...new Set([...REGIONS, ...regions])].map((r) => <option key={r} value={r} />)}</datalist>
        <label className="full">Portrait image URL (optional)
          <input value={portrait.startsWith('data:') ? 'Uploaded image' : portrait} readOnly={portrait.startsWith('data:')} onChange={(e) => setPortrait(e.target.value)} placeholder="https://…" />
        </label>
        <div className="full row">
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
          <button type="button" className="btn" onClick={() => file.current?.click()}><ImagePlus size={16} /> Upload image</button>
          {portrait && <button type="button" className="btn" onClick={() => setPortrait('')}><Trash2 size={16} /> Remove image</button>}
        </div>
        {error && <p className="error full" role="alert">{error}</p>}
        <div className="actions full">
          {canRestore && <button type="button" className="btn" onClick={() => { onRestore?.(); onClose(); }}>Restore defaults</button>}
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">{initial ? 'Save changes' : 'Add character'}</button>
        </div>
      </form>
    </Modal>
  );
}
