import { Clock, Sparkles } from 'lucide-react';
import type { Ledger } from '../hooks/useLedger';
import { ELEMENTS, ELEMENT_COLORS } from '../data/constants';
import { timeAgo } from '../lib/ledger';
import { EmptyState, Panel } from '../components/Controls';

export function Dashboard({ ledger }: { ledger: Ledger }) {
  const { characters: all, progressOf } = ledger;
  const owned = all.filter((c) => progressOf(c.id).owned);
  const total = all.length, pct = total ? Math.round((owned.length / total) * 100) : 0;
  const count = (r: 4 | 5) => ({ own: owned.filter((c) => c.rarity === r).length, all: all.filter((c) => c.rarity === r).length });
  const five = count(5), four = count(4);
  const maxTotal = Math.max(1, ...ELEMENTS.map((e) => all.filter((c) => c.element === e).length));
  const recent = all.map((c) => ({ c, p: progressOf(c.id) })).filter((x) => x.p.updatedAt).sort((a, b) => b.p.updatedAt! - a.p.updatedAt!).slice(0, 6);
  const R = 54, CIRC = 2 * Math.PI * R;

  return (
    <div className="page">
      <h1>Your archive</h1>
      <p className="lead">{owned.length ? `${owned.length} of ${total} travelers have joined your party.` : 'Nothing is recorded yet. Mark the characters you own to begin.'}</p>

      <div className="hero panel">
        <svg viewBox="0 0 140 140" className="ring-svg" role="img" aria-label={`${pct} percent of the collection owned`}>
          {Array.from({ length: 36 }, (_, i) => <line key={i} x1="70" y1="3" x2="70" y2={i % 3 ? 6 : 10} stroke="var(--gold)" strokeOpacity=".55" transform={`rotate(${i * 10} 70 70)`} />)}
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--line)" strokeWidth="9" />
          <circle className="ring" cx="70" cy="70" r={R} fill="none" stroke="var(--gold)" strokeWidth="9" strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct / 100)} transform="rotate(-90 70 70)" />
          <text x="70" y="78" textAnchor="middle" className="ring-num">{pct}%</text>
        </svg>
        <div className="stat-grid">
          <div className="stat"><b>{owned.length}</b><span>Owned</span></div>
          <div className="stat"><b>{total - owned.length}</b><span>Unowned</span></div>
          <div className="stat"><b>{five.own}<small>/{five.all}</small></b><span>Five-star owned</span></div>
          <div className="stat"><b>{four.own}<small>/{four.all}</small></b><span>Four-star owned</span></div>
        </div>
      </div>

      <div className="two">
        <Panel title="Element distribution" icon={<Sparkles size={18} />}>
          {ELEMENTS.map((e) => {
            const t = all.filter((c) => c.element === e).length, o = owned.filter((c) => c.element === e).length;
            return (
              <div className="bar" key={e}>
                <span>{e}</span>
                <div className="bar-track" style={{ width: `${(t / maxTotal) * 100}%` }}>
                  <i style={{ width: `${t ? (o / t) * 100 : 0}%`, background: ELEMENT_COLORS[e] }} />
                </div>
                <span className="bar-n">{o}/{t}</span>
              </div>
            );
          })}
        </Panel>
        <Panel title="Recently modified" icon={<Clock size={18} />}>
          {recent.length ? (
            <ul className="recent">
              {recent.map(({ c, p }) => (
                <li key={c.id}><a href={`#/character/${c.id}`}><b>{c.name}</b><small>{p.owned ? `Lv ${p.level} · C${p.constellation}` : 'Not owned'}</small></a><time>{timeAgo(p.updatedAt!)}</time></li>
              ))}
            </ul>
          ) : <EmptyState title="No changes yet" hint="Open a character and update their level, build or notes. They will show up here." action={<a className="btn" href="#/characters">Browse characters</a>} />}
        </Panel>
      </div>
    </div>
  );
}
