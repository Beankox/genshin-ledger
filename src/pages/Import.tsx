import { useMemo, useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import type { Ledger } from '../hooks/useLedger';
import type { Progress } from '../types';
import { clamp, requiredAscension } from '../lib/ledger';
import { collectHashes, parseEnka, parseGood } from '../lib/importers';
import type { Imported, ParseResult } from '../lib/importers';
import { Panel } from '../components/Controls';

/** Paste your Cloudflare Worker address here (no slash at the end), e.g. 'https://enka-proxy.yourname.workers.dev'.
 *  Leave it empty to call Enka.Network directly, which many browsers block. */
const ENKA_PROXY: string = 'https://enka-proxy.beapatricedeleon325.workers.dev';
const uidUrl = (id: string) => (ENKA_PROXY ? `${ENKA_PROXY.replace(/\/$/, '')}/uid/${id}` : `https://enka.network/api/uid/${id}`);

const STORE_URL = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json';
const IDS_KEY = 'ledger-enka-ids'; // remembers "new character #id = Columbina" on this browser
const loadIds = (): Record<string, string> => { try { return JSON.parse(localStorage.getItem(IDS_KEY) ?? '{}') as Record<string, string>; } catch { return {}; } };
const saveIds = (m: Record<string, string>) => { try { localStorage.setItem(IDS_KEY, JSON.stringify(m)); } catch { /* storage unavailable */ } };
const HTTP_ERRORS: Record<number, string> = {
  400: 'That UID does not look right. It should be 9 digits.',
  404: 'No player with that UID was found.',
  424: 'The game servers are under maintenance. Try again later.',
  429: 'Too many requests right now. Wait a minute and try again.',
};

export function Import({ ledger, notify }: { ledger: Ledger; notify: (msg: string, error?: boolean) => void }) {
  const { characters, patchProgress } = ledger;
  const nameOf = new Map(characters.map((c) => [c.id, c.name]));
  const [uid, setUid] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [found, setFound] = useState<Imported[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [source, setSource] = useState('');
  const [withBuild, setWithBuild] = useState(true);
  const [q, setQ] = useState('');

  const show = (r: ParseResult, from: string) => {
    const known = r.items.filter((i) => nameOf.has(i.id));
    const fresh = r.items.filter((i) => i.id.startsWith('enka:'));
    setFound([...known, ...fresh]);
    setUnknown([...r.unknown, ...r.items.filter((i) => !nameOf.has(i.id) && !i.id.startsWith('enka:')).map((i) => i.id)]);
    setPicked(new Set(known.map((i) => i.id)));
    setSource(from);
  };

  const fetchUid = async () => {
    const id = uid.replace(/\D/g, '');
    if (id.length < 9) { setError('A UID has 9 digits, for example 800123456.'); return; }
    setBusy(true); setError('');
    try {
      const res = await fetch(uidUrl(id));
      if (!res.ok) throw new Error(HTTP_ERRORS[res.status] ?? `Enka.Network returned error ${res.status}.`);
      const data = await res.json();
      if (!Array.isArray(data?.avatarInfoList) || !data.avatarInfoList.length)
        throw new Error('No characters found. In the game, open your Profile, turn on “Show Character Details”, add characters to your Character Showcase, then try again in a few minutes.');
      let store: Record<string, unknown> | null = null;
      try { const r = await fetch(STORE_URL); if (r.ok) store = await r.json(); } catch { /* talents will be skipped */ }
      // weapon and artifact set names come from the relay (it looks them up, so the browser does not download a huge file)
      let names: Record<string, string> | null = null;
      const hashes = collectHashes(data, store);
      if (ENKA_PROXY && hashes.length) {
        try { const r = await fetch(`${ENKA_PROXY.replace(/\/$/, '')}/names/${hashes.join(',')}`); if (r.ok) names = await r.json(); } catch { /* skipped below */ }
      }
      show(parseEnka(data, store, names, loadIds(), characters), `UID ${id}`);
      if (hashes.length && !names) setError('Characters were found, but weapon and artifact names could not be loaded, so only their levels, constellations and talents will be imported, and characters this app does not know by ID may need to be picked by hand.');
    } catch (e) {
      setError(e instanceof TypeError ? 'Could not reach Enka.Network (you may be offline, or the browser blocked the request). You can still import a scanner file below.' : (e as Error).message);
    } finally { setBusy(false); }
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setError('');
    try {
      const r = parseGood(JSON.parse(await f.text()), characters);
      if (!r.items.length) throw new Error('No characters found in that file. It should be a Genshin Optimizer (GOOD) .json export.');
      show(r, f.name);
    } catch (e) {
      setError(e instanceof SyntaxError ? 'That file is not valid JSON.' : (e as Error).message);
    }
  };

  const apply = () => {
    let n = 0;
    for (const it of found) {
      if (!picked.has(it.id)) continue;
      patchProgress(it.id, (p): Progress => {
        const level = clamp(it.level, 1, 90);
        const next: Progress = {
          ...p, owned: true, level, ascension: Math.max(requiredAscension(level), clamp(it.ascension, 0, 6)),
          constellation: clamp(it.constellation, 0, 6), friendship: it.friendship ? clamp(it.friendship, 1, 10) : p.friendship,
          talents: it.talents ?? p.talents,
        };
        if (withBuild && (it.weapon || it.artifacts)) next.build = { weapon: it.weapon ?? p.build.weapon, artifacts: { ...p.build.artifacts, ...it.artifacts } };
        return next;
      });
      n++;
    }
    notify(`Imported ${n} character${n === 1 ? '' : 's'}.`);
    setFound([]); setUnknown([]); setPicked(new Set());
  };

  // a character this app does not know yet: the player says who it is (remembered for next time)
  const assign = (oldId: string, newId: string) => {
    if (!newId) return;
    saveIds({ ...loadIds(), [oldId.slice(5)]: newId });
    setFound((f) => f.map((i) => (i.id === oldId ? { ...i, id: newId } : i)));
    setPicked((s) => new Set(s).add(newId));
  };
  const freeNames = [...characters].filter((c) => !found.some((i) => i.id === c.id)).sort((a, b) => a.name.localeCompare(b.name));

  // quick tick list
  const shown = useMemo(() => characters.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)), [characters, q]);
  const ownedCount = characters.filter((c) => ledger.progressOf(c.id).owned).length;
  const setOwned = (id: string, owned: boolean) => patchProgress(id, (p) => (p.owned === owned ? p : { ...p, owned }));

  const toggle = (id: string) => setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const hasBuild = found.some((i) => i.weapon || i.artifacts);

  return (
    <div className="page">
      <h1>Import characters</h1>
      <p className="lead">Skip the typing: bring your characters in from the game. Your notes and material choices are never overwritten.</p>

      <div className="two">
        <Panel title="From your game (UID)" icon={<Download size={18} />}>
          <p className="muted small">Enter your UID and the ledger reads your in-game <b>Character Showcase</b> through Enka.Network. It brings in level, ascension, constellation, talents, friendship, weapon and artifacts.</p>
          <div className="row mt">
            <input inputMode="numeric" placeholder="UID, e.g. 800123456" aria-label="UID" value={uid} onChange={(e) => setUid(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !busy) void fetchUid(); }} style={{ flex: 1, minWidth: 180 }} />
            <button className="btn primary" onClick={() => void fetchUid()} disabled={busy}>{busy ? 'Looking…' : 'Find my characters'}</button>
          </div>
          <p className="muted small">The game only shares showcased characters (up to 8) and only if <b>Show Character Details</b> is on in your Profile. Swap which characters are showcased and import again to add more, or use the scanner file or the quick tick list below for everyone else. Your UID is only sent to Enka.Network.</p>
        </Panel>

        <Panel title="From a scanner file (everyone)" icon={<Sparkles size={18} />}>
          <p className="muted small">The only way to bring in <b>all</b> your characters, weapons and artifacts at once. Your account login is never needed.</p>
          <ol className="muted small" style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>Install a scanner such as <b>Irminsul</b> or <b>Inventory Kamera</b> and follow its instructions to scan your game.</li>
            <li>Export the result as a <b>Genshin Optimizer (GOOD) .json</b> file.</li>
            <li>Choose that file below, then pick which characters to import.</li>
          </ol>
          <label className="mt">Choose a .json file
            <input type="file" accept=".json,application/json" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
        </Panel>
      </div>

      {error && <p className="note" role="alert">{error}</p>}

      {found.length > 0 && (
        <div className="panel mt">
          <h2><Download size={18} /> Found {found.length} character{found.length === 1 ? '' : 's'} <small className="muted">· {source}</small></h2>
          <ul className="farm-list">
            {found.map((i) => (
              <li key={i.id}>
                {nameOf.has(i.id) ? (
                  <label className="check" style={{ color: 'inherit' }}>
                    <input type="checkbox" checked={picked.has(i.id)} onChange={() => toggle(i.id)} />
                    <span><b>{nameOf.get(i.id)}</b><small>Lv {i.level} · C{i.constellation}{i.talents ? ` · Talents ${i.talents.join('/')}` : ''}{i.weapon ? ` · ${i.weapon.name}` : ''}</small></span>
                  </label>
                ) : (
                  <div style={{ flex: 1 }}>
                    <b>New character (#{i.id.slice(5)})</b>
                    <small className="muted" style={{ display: 'block' }}>Lv {i.level} · C{i.constellation}{i.talents ? ` · Talents ${i.talents.join('/')}` : ''}. This app does not know this ID yet. Who is it?</small>
                    <select aria-label="Which character is this?" value="" onChange={(e) => assign(i.id, e.target.value)} style={{ marginTop: 6 }}>
                      <option value="">Choose the character…</option>
                      {freeNames.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {hasBuild && <label className="check mt" style={{ color: 'inherit' }}><input type="checkbox" checked={withBuild} onChange={(e) => setWithBuild(e.target.checked)} /> Also import weapons and artifacts (replaces the ones saved for these characters)</label>}
          {unknown.length > 0 && <p className="muted small">Not recognised, skipped: {unknown.join(', ')}.</p>}
          <div className="actions">
            <button className="btn" onClick={() => { setFound([]); setUnknown([]); setPicked(new Set()); }}>Cancel</button>
            <button className="btn primary" onClick={apply} disabled={!picked.size}>Import {picked.size} character{picked.size === 1 ? '' : 's'}</button>
          </div>
        </div>
      )}

      <div className="panel mt">
        <h2><Sparkles size={18} /> Quick tick: who do you own?</h2>
        <p className="muted small">The game does not let websites read your full roster, so tap every character you own here ({ownedCount} of {characters.length} ticked). Fill in levels and builds with the imports above, or later.</p>
        <div className="row mt">
          <input type="search" aria-label="Filter by name" placeholder="Filter by name" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
          <button className="btn" onClick={() => shown.forEach((c) => setOwned(c.id, true))}>Tick all shown</button>
          <button className="btn" onClick={() => shown.forEach((c) => setOwned(c.id, false))}>Untick all shown</button>
        </div>
        <div className="chips">
          {shown.map((c) => {
            const on = ledger.progressOf(c.id).owned;
            return <button key={c.id} className={`chip ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => setOwned(c.id, !on)}>{c.name}</button>;
          })}
        </div>
      </div>
    </div>
  );
}
