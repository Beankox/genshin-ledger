import { useEffect, useState } from 'react';
import type { Character } from '../types';
import { ELEMENT_COLORS } from '../data/constants';

type P = Pick<Character, 'id' | 'name' | 'element' | 'rarity' | 'portrait'>;

/* The list of files in public/portraits is fetched once (see scripts/portraits.mjs). */
let known: Set<string> | null = null;
let pending: Promise<void> | null = null;
function loadKnown() {
  pending ??= fetch(`${import.meta.env.BASE_URL}portraits/index.json`)
    .then((r) => (r.ok ? r.json() : []))
    .then((a: unknown) => { known = new Set(Array.isArray(a) ? a.filter((x): x is string => typeof x === 'string') : []); })
    .catch(() => { known = new Set(); });
  return pending;
}
function usePortraitIds() {
  const [ids, setIds] = useState(known);
  useEffect(() => {
    if (known) return;
    let live = true;
    loadKnown().then(() => { if (live) setIds(known); });
    return () => { live = false; };
  }, []);
  return ids;
}

/** Shows the character image; if it is missing or broken, draws a generated placeholder. */
export function Portrait({ character: c }: { character: P }) {
  const ids = usePortraitIds();
  const [failed, setFailed] = useState(false);
  const src = c.portrait || (ids?.has(c.id) ? `${import.meta.env.BASE_URL}portraits/${c.id}.png` : '');
  useEffect(() => setFailed(false), [src]);
  if (src && !failed) return <img className="portrait" src={src} alt={c.name} loading="lazy" onError={() => setFailed(true)} />;
  const col = ELEMENT_COLORS[c.element], g = `pg-${c.id}`;
  return (
    <svg className="portrait" viewBox="0 0 200 240" role="img" aria-label={`${c.name} placeholder portrait`}>
      <defs><linearGradient id={g} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} /><stop offset="1" stopColor="#10163e" /></linearGradient></defs>
      <rect width="200" height="240" fill={`url(#${g})`} />
      <g stroke="#fff" strokeOpacity=".28" fill="none">
        <circle cx="100" cy="104" r="62" /><circle cx="100" cy="104" r="76" strokeDasharray="2 7" />
        <path d="M20 40L60 22L96 48M150 30L184 70M30 190L70 170L120 200" />
      </g>
      <g fill="#fff" fillOpacity=".7"><circle cx="20" cy="40" r="2" /><circle cx="60" cy="22" r="1.6" /><circle cx="184" cy="70" r="2" /><circle cx="30" cy="190" r="1.6" /><circle cx="120" cy="200" r="2" /></g>
      <text x="100" y="128" textAnchor="middle" fontSize="76" fontFamily="Cormorant Garamond, Georgia, serif" fontWeight="700" fill="#fff">{c.name[0]?.toUpperCase()}</text>
      <text x="100" y="222" textAnchor="middle" fontSize="13" fill="#f4e7b8" letterSpacing="3">{'★'.repeat(c.rarity)}</text>
    </svg>
  );
}
