import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';
import type { Ledger } from '../hooks/useLedger';
import { GEM_TIERS, TALENT_BOOKS, ascensionNeeds, gemFamilyFor, talentNeeds } from '../data/materials';
import { EmptyState, Panel } from '../components/Controls';

interface Group { key: string; label: string; counts: number[]; who: string[] }
type GroupMap = Map<string, Group>;

const BOOKS = TALENT_BOOKS.flatMap((t) => t.books.map((b) => ({ ...b, nation: t.nation })));
const stripBook = (s: string) => s.trim().toLowerCase().replace(/^(guide to|teachings of|philosophies of)\s+/, '');
const findBook = (s: string) => BOOKS.find((b) => b.name.toLowerCase() === stripBook(s));
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** Every book can be farmed on Sunday. Books with no schedule listed are treated as always available. */
const farmableOn = (days: string | undefined, today: string) => !days || today === 'Sun' || days.split('/').includes(today);

function bump(map: GroupMap, name: string, size: number, idx: number, amount: number, who: string, display?: string) {
  if (amount <= 0) return;
  const key = name.trim().toLowerCase();
  let g = map.get(key);
  if (!g) { g = { key, label: display ?? (name.trim() || 'Not set'), counts: new Array<number>(size).fill(0), who: [] }; map.set(key, g); }
  g.counts[idx] += amount;
  if (!g.who.includes(who)) g.who.push(who);
}
const total = (g: Group) => g.counts.reduce((a, b) => a + b, 0);
const sorted = (m: GroupMap) => [...m.values()].sort((a, b) => total(b) - total(a) || a.label.localeCompare(b.label));
const parts = (labels: readonly string[], counts: number[]) =>
  labels.map((l, i) => (counts[i] ? `${l} ${counts[i].toLocaleString()}` : '')).filter(Boolean).join(' · ');
const people = (g: Group) => (g.who.length > 4 ? `${g.who.slice(0, 4).join(', ')} +${g.who.length - 4} more` : g.who.join(', '));

function GroupList({ groups, fmt, badge }: { groups: Group[]; fmt: (g: Group) => string; badge?: (g: Group) => ReactNode }) {
  if (!groups.length) return <p className="muted small">Nothing needed here.</p>;
  return (
    <ul className="farm-list">
      {groups.map((g) => (
        <li key={g.key || 'unset'}>
          <div><b>{g.label}</b><small>{people(g)}</small>{badge?.(g)}</div>
          <span className="amt">{fmt(g)}</span>
        </li>
      ))}
    </ul>
  );
}

export function Farming({ ledger }: { ledger: Ledger }) {
  const { characters, progressOf } = ledger;
  const [everyone, setEveryone] = useState(false);
  const today = DAYS[new Date().getDay()];

  const d = useMemo(() => {
    const books: GroupMap = new Map(), weekly: GroupMap = new Map(), boss: GroupMap = new Map(), local: GroupMap = new Map(),
      gems: GroupMap = new Map(), enemy: GroupMap = new Map();
    let mora = 0, crown = 0, count = 0;
    for (const c of characters) {
      const p = progressOf(c.id);
      if (!p.owned && !everyone) continue;
      count++;
      const a = ascensionNeeds(p.ascension), t = talentNeeds(p.talents), m = p.materials;
      mora += a.mora + t.mora; crown += t.crown;
      const info = findBook(m.book), bookName = info ? info.name : m.book;
      bump(books, bookName, 3, 0, t.teachings, c.name, info?.name);
      bump(books, bookName, 3, 1, t.guides, c.name, info?.name);
      bump(books, bookName, 3, 2, t.philosophies, c.name, info?.name);
      bump(weekly, m.weekly, 1, 0, t.weekly, c.name);
      bump(boss, m.boss, 1, 0, a.boss, c.name);
      bump(local, m.local, 1, 0, a.local, c.name);
      const fam = gemFamilyFor(c.id, c.element);
      a.gems.forEach((n, i) => bump(gems, fam, 4, i, n, c.name));
      a.mobs.forEach((n, i) => bump(enemy, m.enemy, 3, i, n, c.name));
    }
    const lists = { books: sorted(books), weekly: sorted(weekly), boss: sorted(boss), local: sorted(local), gems: sorted(gems), enemy: sorted(enemy) };
    const weeklyTotal = lists.weekly.reduce((s, g) => s + total(g), 0);
    const unset = [lists.books, lists.weekly, lists.boss, lists.local, lists.enemy].some((l) => l.some((g) => g.key === ''));
    return { ...lists, mora, crown, count, weeklyTotal, unset };
  }, [characters, progressOf, everyone]);

  const todayBooks = d.books.filter((g) => { const b = findBook(g.label); return !!b && farmableOn(b.days, today); });
  const bookBadge = (g: Group) => {
    const b = findBook(g.label);
    if (!b) return null;
    return <small className="sched">{b.nation} · {b.days ? `${b.days}/Sun` : 'any day'}{farmableOn(b.days, today) && <span className="pill today">Today</span>}</small>;
  };
  const one = (g: Group) => `×${g.counts[0].toLocaleString()}`;
  const bookText = (g: Group) => parts(['Teachings', 'Guides', 'Philosophies'], g.counts);

  return (
    <div className="page">
      <h1>Farming planner</h1>
      <p className="lead">Everything {everyone ? 'in your roster' : 'your owned characters'} still need to reach ascension 6 and talent level 10.</p>
      <label className="check"><input type="checkbox" checked={everyone} onChange={(e) => setEveryone(e.target.checked)} /> Include characters I don’t own yet</label>

      {d.count === 0 ? (
        <EmptyState title="Nothing to plan yet" hint="Mark the characters you own, then set their ascension and talent levels." action={<a className="btn" href="#/characters">Browse characters</a>} />
      ) : (
        <>
          <div className="panel mt">
            <div className="stat-grid">
              <div className="stat"><b>{d.count}</b><span>Characters counted</span></div>
              <div className="stat"><b>{d.mora.toLocaleString()}</b><span>Mora</span></div>
              <div className="stat"><b>{d.crown}</b><span>Crowns of Insight</span></div>
              <div className="stat"><b>{d.weeklyTotal}</b><span>Weekly boss drops</span></div>
            </div>
          </div>

          {d.unset && <p className="note">Some characters have no talent book, boss drop, specialty or enemy drop chosen, so their needs are grouped under “Not set”. Open the character and fill in the Materials panel.</p>}

          <div className="two mt">
            <Panel title="Farm today" icon={<CalendarDays size={18} />}>
              <p className="muted small">Today is {today}. Based on your device’s date; the game’s day changes at 4 AM server time.</p>
              <GroupList groups={todayBooks} fmt={bookText} badge={bookBadge} />
              {!todayBooks.length && <p className="muted small">No talent books are needed today. Check the other sections below.</p>}
            </Panel>
            <Panel title="Talent books" icon={<Sparkles size={18} />}>
              <GroupList groups={d.books} fmt={bookText} badge={bookBadge} />
            </Panel>
            <Panel title="Weekly boss drops"><GroupList groups={d.weekly} fmt={one} /></Panel>
            <Panel title="Boss drops"><GroupList groups={d.boss} fmt={one} /></Panel>
            <Panel title="Local specialties"><GroupList groups={d.local} fmt={one} /></Panel>
            <Panel title="Ascension gems"><GroupList groups={d.gems} fmt={(g) => parts(GEM_TIERS, g.counts)} /></Panel>
            <Panel title="Enemy drops"><GroupList groups={d.enemy} fmt={(g) => parts(['1★', '2★', '3★'], g.counts)} /></Panel>
          </div>
          <p className="muted small" style={{ color: '#b9bde4' }}>Character EXP, and the enemy drops that talents use, are not counted.</p>
        </>
      )}
    </div>
  );
}
