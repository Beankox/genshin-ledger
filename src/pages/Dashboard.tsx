import { CalendarDays, Clock, Sparkles, Star, Target, Trophy } from 'lucide-react';
import type { Ledger } from '../hooks/useLedger';
import { ELEMENTS, ELEMENT_COLORS, WEAPON_TYPES } from '../data/constants';
import { talentNeeds } from '../data/materials';
import { DAYS, farmableOn, findBook } from '../lib/farm';
import { timeAgo } from '../lib/ledger';
import { EmptyState, Panel } from '../components/Controls';

export function Dashboard({ ledger }: { ledger: Ledger }) {
  const { characters: all, progressOf } = ledger;
  const owned = all.filter((c) => progressOf(c.id).owned);
  const ownedP = owned.map((c) => ({ c, p: progressOf(c.id) }));
  const total = all.length, pct = total ? Math.round((owned.length / total) * 100) : 0;
  const count = (r: 4 | 5) => ({ own: owned.filter((c) => c.rarity === r).length, all: all.filter((c) => c.rarity === r).length });
  const five = count(5), four = count(4);
  const maxTotal = Math.max(1, ...ELEMENTS.map((e) => all.filter((c) => c.element === e).length));
  const recent = all.map((c) => ({ c, p: progressOf(c.id) })).filter((x) => x.p.updatedAt).sort((a, b) => b.p.updatedAt! - a.p.updatedAt!).slice(0, 6);
  const R = 54, CIRC = 2 * Math.PI * R;

  // highlights
  const lv90 = ownedP.filter((x) => x.p.level >= 90).length;
  const talentsMax = ownedP.filter((x) => x.p.talents.every((t) => t >= 10)).length;
  const c6 = ownedP.filter((x) => x.p.constellation >= 6).length;
  const constTotal = ownedP.reduce((s, x) => s + x.p.constellation, 0);
  const avgLv = ownedP.length ? Math.round(ownedP.reduce((s, x) => s + x.p.level, 0) / ownedP.length) : 0;
  const bestFriends = ownedP.filter((x) => x.p.friendship >= 10).length;

  // by region and by weapon
  const regions = [...new Set(all.map((c) => c.region))]
    .map((r) => ({ r, t: all.filter((c) => c.region === r).length, o: owned.filter((c) => c.region === r).length }))
    .sort((a, b) => b.t - a.t || a.r.localeCompare(b.r));
  const maxRegion = Math.max(1, ...regions.map((x) => x.t));
  const weapons = WEAPON_TYPES.map((w) => ({ w, t: all.filter((c) => c.weapon === w).length, o: owned.filter((c) => c.weapon === w).length }));
  const maxWeapon = Math.max(1, ...weapons.map((x) => x.t));

  // closest to fully built (level 90 + every talent 10)
  const score = (p: { level: number; talents: number[] }) => (p.level / 90 + (p.talents[0] + p.talents[1] + p.talents[2]) / 30) / 2;
  const closest = ownedP.filter((x) => score(x.p) < 1).sort((a, b) => score(b.p) - score(a.p)).slice(0, 5);

  // talent books you can farm today
  const today = DAYS[new Date().getDay()];
  const books = new Map<string, { name: string; who: string[] }>();
  for (const { c, p } of ownedP) {
    const t = talentNeeds(p.talents);
    if (t.teachings + t.guides + t.philosophies <= 0) continue;
    const b = findBook(p.materials.book);
    if (!b || !farmableOn(b.days, today)) continue;
    const g = books.get(b.name) ?? { name: b.name, who: [] };
    g.who.push(c.name); books.set(b.name, g);
  }
  const todayBooks = [...books.values()].sort((a, b) => b.who.length - a.who.length);
  const noBook = ownedP.filter((x) => !findBook(x.p.materials.book)).length;

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

      {!owned.length && (
        <div className="panel mt">
          <h2><Sparkles size={18} /> Getting started</h2>
          <ol className="steps">
            <li><b>Mark what you own.</b> Open <a href="#/characters">All characters</a> and press the + on each character you have.</li>
            <li><b>Fill in their details.</b> Open a character to set level, constellation, talents and materials.</li>
            <li><b>Plan your farming.</b> The <a href="#/farming">Farming planner</a> adds up everything you still need.</li>
            <li><b>Back it up.</b> Everything is saved in this browser, so export a copy from <a href="#/data">Data</a> now and then.</li>
          </ol>
        </div>
      )}

      <div className="three mt">
        <Panel title="Highlights" icon={<Trophy size={18} />}>
          <div className="hl-grid">
            <div className="stat"><b>{lv90}</b><span>At level 90</span></div>
            <div className="stat"><b>{talentsMax}</b><span>Talents all 10</span></div>
            <div className="stat"><b>{c6}</b><span>At C6</span></div>
            <div className="stat"><b>{constTotal}</b><span>Constellations</span></div>
            <div className="stat"><b>{avgLv || '–'}</b><span>Average level</span></div>
            <div className="stat"><b>{bestFriends}</b><span>Friendship 10</span></div>
          </div>
        </Panel>

        <Panel title="Farm today" icon={<CalendarDays size={18} />}>
          <p className="muted small">{today}’s talent books for your owned characters.</p>
          {todayBooks.length ? (
            <ul className="recent">
              {todayBooks.slice(0, 4).map((g) => (
                <li key={g.name}><a href="#/farming"><b>{g.name}</b><small>{g.who.length > 3 ? `${g.who.slice(0, 3).join(', ')} +${g.who.length - 3} more` : g.who.join(', ')}</small></a></li>
              ))}
            </ul>
          ) : (
            <p className="muted small">{owned.length ? (noBook ? `Nothing scheduled today. ${noBook} owned character${noBook > 1 ? 's have' : ' has'} no talent book set yet.` : 'No talent books are needed today.') : 'Mark some characters as owned to see this.'}</p>
          )}
          <a className="btn mt" href="#/farming">Open farming planner</a>
        </Panel>

        <Panel title="Closest to fully built" icon={<Target size={18} />}>
          {closest.length ? (
            <ul className="recent">
              {closest.map(({ c, p }) => (
                <li key={c.id}>
                  <a href={`#/character/${c.id}`}>
                    <b>{c.name}</b><small>Lv {p.level} · Talents {p.talents.join('/')}</small>
                    <span className="mini"><i style={{ width: `${Math.round(score(p) * 100)}%`, background: ELEMENT_COLORS[c.element] }} /></span>
                  </a>
                  <time>{Math.round(score(p) * 100)}%</time>
                </li>
              ))}
            </ul>
          ) : <p className="muted small">{owned.length ? 'Everyone you own is fully built. Nicely done!' : 'Owned characters will show up here, ranked by level and talents.'}</p>}
        </Panel>

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

        <Panel title="By region" icon={<Star size={18} />}>
          {regions.map(({ r, t, o }) => (
            <div className="bar wide" key={r}>
              <span>{r}</span>
              <div className="bar-track" style={{ width: `${(t / maxRegion) * 100}%` }}><i style={{ width: `${t ? (o / t) * 100 : 0}%`, background: 'var(--gold)' }} /></div>
              <span className="bar-n">{o}/{t}</span>
            </div>
          ))}
        </Panel>

        <Panel title="By weapon" icon={<Star size={18} />}>
          {weapons.map(({ w, t, o }) => (
            <div className="bar wide" key={w}>
              <span>{w}</span>
              <div className="bar-track" style={{ width: `${(t / maxWeapon) * 100}%` }}><i style={{ width: `${t ? (o / t) * 100 : 0}%`, background: 'var(--lav)' }} /></div>
              <span className="bar-n">{o}/{t}</span>
            </div>
          ))}
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

        <Panel title="Quick links" icon={<Sparkles size={18} />}>
          <div className="quick">
            <a className="btn" href="#/unowned">Characters I still need</a>
            <a className="btn" href="#/owned">My collection</a>
            <a className="btn" href="#/farming">Farming planner</a>
            <a className="btn" href="#/data">Back up my data</a>
          </div>
        </Panel>
      </div>
    </div>
  );
}
