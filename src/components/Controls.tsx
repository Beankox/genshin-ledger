import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { clamp } from '../lib/ledger';

export function Stepper({ value, min, max, onChange, label, prefix = '' }: {
  value: number; min: number; max: number; onChange: (v: number) => void; label: string; prefix?: string;
}) {
  return (
    <span className="stepper">
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}><Minus size={14} /></button>
      <b aria-live="polite">{prefix}{value}</b>
      <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}><Plus size={14} /></button>
    </span>
  );
}

/** Number input that lets you type freely and clamps when you finish. */
export function NumberField({ value, min, max, onCommit, label }: {
  value: number; min: number; max: number; onCommit: (v: number) => void; label: string;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = () => { const v = clamp(Number(text), min, max); setText(String(v)); if (v !== value) onCommit(v); };
  return (
    <input type="number" inputMode="numeric" aria-label={label} min={min} max={max} value={text}
      onChange={(e) => setText(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
  );
}

/** C0–C6 drawn as a small star chart: lit nodes joined by a line. */
export function ConstellationPicker({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div className="constellation" style={{ '--el': color } as React.CSSProperties} role="group" aria-label="Constellation level">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <button key={i} type="button" className={i > 0 && i <= value ? 'lit' : i === 0 && value === 0 ? 'base' : ''}
          aria-pressed={i === value} aria-label={`Constellation ${i}`} onClick={() => onChange(i)}>
          C{i}
        </button>
      ))}
    </div>
  );
}

export const Stars = ({ n }: { n: number }) => <span className="stars" aria-label={`${n} star`}>{'★'.repeat(n)}</span>;

export function Pills({ element, weapon, region, rarity, color }: { element: string; weapon: string; region: string; rarity: number; color: string }) {
  return (
    <div className="pills">
      <span className="pill el" style={{ '--el': color } as React.CSSProperties}><i />{element}</span>
      <span className="pill">{weapon}</span><span className="pill">{region}</span><span className="pill"><Stars n={rarity} /></span>
    </div>
  );
}

export const Panel = ({ title, icon, children, className = '' }: { title?: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) => (
  <section className={`panel ${className}`}>{title && <h2>{icon}{title}</h2>}{children}</section>
);

export const EmptyState = ({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) => (
  <div className="empty"><span aria-hidden>✦</span><h3>{title}</h3>{hint && <p>{hint}</p>}{action}</div>
);
