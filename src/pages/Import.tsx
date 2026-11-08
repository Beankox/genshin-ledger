import { useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import type { Ledger } from '../hooks/useLedger';
import type { Progress } from '../types';
import { clamp, requiredAscension } from '../lib/ledger';
import { parseEnka, parseGood } from '../lib/importers';
import type { Imported, ParseResult } from '../lib/importers';
import { Panel } from '../components/Controls';

/** Paste your Cloudflare Worker address here (no slash at the end), e.g. 'https://enka-proxy.yourname.workers.dev'.
 *  Leave it empty to call Enka.Network directly, which many browsers block. */
const ENKA_PROXY: string = 'https://enka-proxy.beapatricedeleon325.workers.dev';
const uidUrl = (id: string) => (ENKA_PROXY ? `${ENKA_PROXY.replace(/\/$/, '')}/uid/${id}` : `https://enka.network/api/uid/${id}`);

const STORE_URL = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json';
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

  const show = (r: ParseResult, from: string) => {
    const known = r.items.filter((i) => nameOf.has(i.id));
    setFound(known);
    setUnknown([...r.unknown, ...r.items.filter((i) => !nameOf.has(i.id)).map((i) => i.id)]);
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
      show(parseEnka(data, store), `UID ${id}`);
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

  const toggle = (id: string) => setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const hasBuild = found.some((i) => i.weapon || i.artifacts);

  return (
    <div className="page">
      <h1>Import characters</h1>
      <p className="lead">Skip the typing: bring your characters in from the game. Your notes and material choices are never overwritten.</p>

      <div className="two">
        <Panel title="From your game (UID)" icon={<Download size={18} />}>
          <p className="muted small">Enter your UID and the ledger reads your in-game <b>Character Showcase</b> through Enka.Network. It brings in level, ascension, constellation, talents and friendship.</p>
          <div className="row mt">
            <input inputMode="numeric" placeholder="UID, e.g. 800123456" aria-label="UID" value={uid} onChange={(e) => setUid(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !busy) void fetchUid(); }} style={{ flex: 1, minWidth: 180 }} />
            <button className="btn primary" onClick={() => void fetchUid()} disabled={busy}>{busy ? 'Looking…' : 'Find my characters'}</button>
          </div>
          <p className="muted small">The game only shares showcased characters (up to 8) and only if <b>Show Character Details</b> is on in your Profile. Swap which characters are showcased and import again to add more. Your UID is only sent to Enka.Network.</p>
        </Panel>

        <Panel title="From a scanner file (everyone)" icon={<Sparkles size={18} />}>
          <p className="muted small">To bring in <b>all</b> characters at once, export a <b>Genshin Optimizer (GOOD) .json</b> file with a scanner such as Inventory Kamera or Irminsul, then choose it here. Weapons and artifacts come along too.</p>
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
                <label className="check" style={{ color: 'inherit' }}>
                  <input type="checkbox" checked={picked.has(i.id)} onChange={() => toggle(i.id)} />
                  <span><b>{nameOf.get(i.id)}</b><small>Lv {i.level} · C{i.constellation}{i.talents ? ` · Talents ${i.talents.join('/')}` : ''}{i.weapon ? ` · ${i.weapon.name}` : ''}</small></span>
                </label>
              </li>
            ))}
          </ul>
          {hasBuild && <label className="check mt" style={{ color: 'inherit' }}><input type="checkbox" checked={withBuild} onChange={(e) => setWithBuild(e.target.checked)} /> Also import weapons and artifacts (replaces the ones saved for these characters)</label>}
          {unknown.length > 0 && <p className="muted small">Not recognised, skipped: {unknown.join(', ')}.</p>}
          <div className="actions">
            <button className="btn" onClick={() => { setFound([]); setUnknown([]); }}>Cancel</button>
            <button className="btn primary" onClick={apply} disabled={!picked.size}>Import {picked.size} character{picked.size === 1 ? '' : 's'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
