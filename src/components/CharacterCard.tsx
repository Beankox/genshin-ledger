import { Check, Plus } from 'lucide-react';
import type { Character, Progress } from '../types';
import { ELEMENT_COLORS } from '../data/constants';
import { Portrait } from './Portrait';

export function CharacterCard({ character: c, progress: p, onToggleOwned }: { character: Character; progress: Progress; onToggleOwned: () => void }) {
  return (
    <article className={`card r${c.rarity} ${p.owned ? '' : 'off'}`} style={{ '--el': ELEMENT_COLORS[c.element] } as React.CSSProperties}>
      <a href={`#/character/${c.id}`} className="card-link" aria-label={`Open ${c.name}`}>
        <div className="card-art"><Portrait character={c} /><span className="card-el">{c.element}</span></div>
        <div className="card-meta">
          <b>{c.name}</b>
          <small>{c.weapon} · {c.region}</small>
          <small className="card-prog">{p.owned ? `Lv ${p.level} · C${p.constellation} · ♥${p.friendship}` : 'Not owned'}</small>
        </div>
      </a>
      <button className={`own-toggle ${p.owned ? 'on' : ''}`} onClick={onToggleOwned}
        aria-label={p.owned ? `Mark ${c.name} as not owned` : `Mark ${c.name} as owned`} title={p.owned ? 'Owned' : 'Mark as owned'}>
        {p.owned ? <Check size={15} /> : <Plus size={15} />}
      </button>
    </article>
  );
}
