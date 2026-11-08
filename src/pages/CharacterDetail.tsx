import { useState } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, Gem, Heart, Package, Pencil, ScrollText, Swords, Trash2, Wand2 } from 'lucide-react';
import type { Ledger } from '../hooks/useLedger';
import type { Build, SlotKey } from '../types';
import { game8Url } from '../data/guides';
import { BOSS_DROPS, ENEMY_DROPS, GEM_TIERS, TALENT_BOOKS, ascensionNeeds, gemFamilyFor, talentNeeds } from '../data/materials';
import type { Materials } from '../types';
import { ARTIFACT_SETS, ELEMENT_COLORS, SLOTS, SUBSTATS, TALENT_NAMES, WEAPON_NAMES } from '../data/constants';
import { ASC_CAPS, clamp, requiredAscension } from '../lib/ledger';
import { Portrait } from '../components/Portrait';
import { CharacterForm } from '../components/CharacterForm';
import { ConfirmDialog } from '../components/Modal';
import { ConstellationPicker, EmptyState, NumberField, Panel, Pills, Stepper } from '../components/Controls';

export function CharacterDetail({ ledger, id, notify }: { ledger: Ledger; id: string; notify: (m: string) => void }) {
  const { characters, progressOf, patchProgress, saveCharacter, restoreCharacter, deleteCharacter, isCustom, isEdited } = ledger;
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const c = characters.find((x) => x.id === id);
  if (!c) return <div className="page"><EmptyState title="Character not found" hint="It may have been deleted or the link is wrong." action={<a className="btn" href="#/characters">Back to characters</a>} /></div>;

  const p = progressOf(c.id), color = ELEMENT_COLORS[c.element], b = p.build;
  const up = (patch: Partial<typeof p>) => patchProgress(c.id, (x) => ({ ...x, ...patch }));
  const upBuild = (fn: (b: Build) => Build) => patchProgress(c.id, (x) => ({ ...x, build: fn(x.build) }));
  const guide = game8Url(c.id);
  const upMat = (patch: Partial<Materials>) => up({ materials: { ...p.materials, ...patch } });
  const gem = gemFamilyFor(c.id, c.element), asc = ascensionNeeds(p.ascension), tal = talentNeeds(p.talents);
  const nations = [...TALENT_BOOKS].sort((a, b) => Number(b.nation === c.region) - Number(a.nation === c.region));
  const nf = (n: number) => n.toLocaleString('en-US');
  const setLevel = (lv: number) => up({ level: lv, ascension: Math.max(p.ascension, requiredAscension(lv)) });
  const setAsc = (a: number) => up({ ascension: a, level: Math.min(p.level, ASC_CAPS[a]) });
  const setPiece = (slot: SlotKey, patch: Partial<Build['artifacts'][SlotKey]>) =>
    upBuild((x) => ({ ...x, artifacts: { ...x.artifacts, [slot]: { ...x.artifacts[slot], ...patch } } }));
  const setSub = (slot: SlotKey, i: number, patch: Partial<{ stat: string; value: string }>) =>
    setPiece(slot, { subs: b.artifacts[slot].subs.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  return (
    <div className="page" style={{ '--el': color } as React.CSSProperties}>
      <a className="btn back" href={p.owned ? '#/owned' : '#/characters'}><ArrowLeft size={16} /> Back</a>

      <div className="detail">
        <aside>
          <div className={`panel portrait-frame r${c.rarity}`}><Portrait character={c} /></div>
        </aside>
        <div>
          <div className="page-head">
            <div><h1>{c.name}</h1><Pills element={c.element} weapon={c.weapon} region={c.region} rarity={c.rarity} color={color} /></div>
            <div className="row">
              {guide && <a className="btn" href={guide} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> Game8 guide</a>}
              <button className="btn" onClick={() => setEditing(true)}><Pencil size={16} /> Edit info</button>
              {isCustom(c.id) && <button className="btn danger" onClick={() => setDeleting(true)}><Trash2 size={16} /> Delete</button>}
            </div>
          </div>

          <div className={`own-banner ${p.owned ? 'on' : ''}`}>
            <span>{p.owned ? `Lv ${p.level}/90 · C${p.constellation} · Friendship ${p.friendship}` : 'Not in your collection. Add them to start tracking progress and builds.'}</span>
            <button className={`btn ${p.owned ? '' : 'primary'}`} onClick={() => up({ owned: !p.owned })}>{p.owned ? 'Remove from collection' : 'Add to collection'}</button>
          </div>

          <fieldset className="tracking" disabled={!p.owned}>
            <div className="two">
              <Panel title="Progress" icon={<Wand2 size={18} />}>
                <div className="field"><span>Level (1–90)</span><NumberField label="Character level" value={p.level} min={1} max={90} onCommit={setLevel} /></div>
                <div className="field"><span>Ascension phase <small>cap Lv {ASC_CAPS[p.ascension]}</small></span><Stepper label="ascension" value={p.ascension} min={requiredAscension(p.level)} max={6} onChange={setAsc} /></div>
                <div className="field"><span><Heart size={14} /> Friendship (1–10)</span><Stepper label="friendship" value={p.friendship} min={1} max={10} onChange={(v) => up({ friendship: v })} /></div>
              </Panel>
              <Panel title="Constellation" icon={<Wand2 size={18} />}>
                <ConstellationPicker value={p.constellation} color={color} onChange={(v) => up({ constellation: v })} />
                <p className="muted small">{p.constellation === 0 ? 'No constellations unlocked.' : `${p.constellation} of 6 unlocked.`}</p>
              </Panel>
            </div>

            <Panel title="Talents" icon={<ScrollText size={18} />} className="mt">
              {TALENT_NAMES.map((n, i) => (
                <div className="field" key={n}><span>{n}</span>
                  <Stepper label={`${n} level`} value={p.talents[i]} min={1} max={10} onChange={(v) => up({ talents: p.talents.map((t, j) => (j === i ? v : t)) as typeof p.talents })} />
                </div>
              ))}
            </Panel>

            <Panel title="Materials" icon={<Package size={18} />} className="mt">
              <div className="cols3">
                <label>Talent book
                  <select value={p.materials.book} onChange={(e) => upMat({ book: e.target.value })}>
                    <option value="">Choose…</option>
                    {nations.map((n) => (
                      <optgroup key={n.nation} label={n.nation}>
                        {n.books.map((b) => <option key={b.name} value={b.name}>{b.name}{b.days ? ` (${b.days})` : ''}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <label>Boss drop<input list="boss-drops" value={p.materials.boss} placeholder="e.g. Hoarfrost Core" onChange={(e) => upMat({ boss: e.target.value })} /></label>
                <label>Local specialty<input value={p.materials.local} placeholder="e.g. Cecilia" onChange={(e) => upMat({ local: e.target.value })} /></label>
                <label>Enemy drops<input list="enemy-drops" value={p.materials.enemy} placeholder="e.g. Slime Condensate" onChange={(e) => upMat({ enemy: e.target.value })} /></label>
                <label>Weekly boss drop<input value={p.materials.weekly} placeholder="Talent level 7+" onChange={(e) => upMat({ weekly: e.target.value })} /></label>
              </div>
              <datalist id="boss-drops">{BOSS_DROPS.map((x) => <option key={x} value={x} />)}</datalist>
              <datalist id="enemy-drops">{ENEMY_DROPS.map((x) => <option key={x} value={x} />)}</datalist>
              <h3 className="needs-title"><BookOpen size={15} /> Still needed to max out</h3>
              <ul className="needs">
                <li><span>Ascension to phase 6 ({6 - p.ascension} left)</span><b>{nf(asc.mora)} Mora</b></li>
                {asc.gems.map((n, i) => n > 0 && <li key={i}><span>{gem} {GEM_TIERS[i]}</span><b>×{n}</b></li>)}
                {asc.boss > 0 && <li><span>{p.materials.boss || 'Boss drop'}</span><b>×{asc.boss}</b></li>}
                {asc.local > 0 && <li><span>{p.materials.local || 'Local specialty'}</span><b>×{asc.local}</b></li>}
                {asc.mobs.map((n, i) => n > 0 && <li key={i}><span>{p.materials.enemy || 'Enemy drops'} ({i + 1}-star)</span><b>×{n}</b></li>)}
                <li><span>Talents to level 10 (all three)</span><b>{nf(tal.mora)} Mora</b></li>
                {tal.teachings > 0 && <li><span>Teachings of {p.materials.book || '…'}</span><b>×{tal.teachings}</b></li>}
                {tal.guides > 0 && <li><span>Guide to {p.materials.book || '…'}</span><b>×{tal.guides}</b></li>}
                {tal.philosophies > 0 && <li><span>Philosophies of {p.materials.book || '…'}</span><b>×{tal.philosophies}</b></li>}
                {tal.weekly > 0 && <li><span>{p.materials.weekly || 'Weekly boss drop'}</span><b>×{tal.weekly}</b></li>}
                {tal.crown > 0 && <li><span>Crown of Insight</span><b>×{tal.crown}</b></li>}
              </ul>
              <p className="muted small">Counts are totals for the remaining steps. Character EXP and the enemy drops used by talents are not included.{guide ? ' The Game8 guide lists which materials this character uses.' : ''}</p>
            </Panel>

            <Panel title="Weapon" icon={<Swords size={18} />} className="mt">
              <div className="cols3">
                <label>Name<input list={`w-${c.weapon}`} value={b.weapon.name} placeholder={`Choose a ${c.weapon.toLowerCase()}`} onChange={(e) => upBuild((x) => ({ ...x, weapon: { ...x.weapon, name: e.target.value } }))} /></label>
                <datalist id={`w-${c.weapon}`}>{WEAPON_NAMES[c.weapon].map((w) => <option key={w} value={w} />)}</datalist>
                <label>Level<NumberField label="Weapon level" value={b.weapon.level} min={1} max={90} onCommit={(v) => upBuild((x) => ({ ...x, weapon: { ...x.weapon, level: clamp(v, 1, 90) } }))} /></label>
                <label>Refinement<select value={b.weapon.refinement} onChange={(e) => upBuild((x) => ({ ...x, weapon: { ...x.weapon, refinement: Number(e.target.value) } }))}>{[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>R{r}</option>)}</select></label>
              </div>
            </Panel>

            <Panel title="Artifacts" icon={<Gem size={18} />} className="mt">
              <div className="slots">
                {SLOTS.map((s) => {
                  const a = b.artifacts[s.key];
                  return (
                    <div className="slot" key={s.key}>
                      <h3>{s.label}</h3>
                      <label>Set<input list="artifact-sets" value={a.set} placeholder="Artifact set" onChange={(e) => setPiece(s.key, { set: e.target.value })} /></label>
                      <label>Main stat
                        <select value={a.main} onChange={(e) => setPiece(s.key, { main: e.target.value })}>
                          <option value="">Choose…</option>
                          {a.main && !s.mains.includes(a.main) && <option>{a.main}</option>}
                          {s.mains.map((m) => <option key={m}>{m}</option>)}
                        </select>
                      </label>
                      <div className="subs">
                        {a.subs.map((sub, i) => (
                          <div className="sub" key={i}>
                            <select aria-label={`${s.label} substat ${i + 1}`} value={sub.stat} onChange={(e) => setSub(s.key, i, { stat: e.target.value })}>
                              <option value="">Substat</option>{SUBSTATS.map((x) => <option key={x}>{x}</option>)}
                            </select>
                            <input aria-label={`${s.label} substat ${i + 1} value`} inputMode="decimal" placeholder="Value" value={sub.value} onChange={(e) => setSub(s.key, i, { value: e.target.value })} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <datalist id="artifact-sets">{ARTIFACT_SETS.map((x) => <option key={x} value={x} />)}</datalist>
            </Panel>

            <Panel title="Notes" className="mt">
              <textarea rows={4} aria-label="Character notes" placeholder="Team ideas, farming plans, reminders" value={p.notes} onChange={(e) => up({ notes: e.target.value })} />
            </Panel>
          </fieldset>
        </div>
      </div>

      {editing && <CharacterForm initial={c} existingIds={new Set(characters.map((x) => x.id))} regions={[...new Set(characters.map((x) => x.region))]}
        canRestore={isEdited(c.id)} onSave={saveCharacter} onRestore={() => restoreCharacter(c.id)} onClose={() => setEditing(false)} />}
      {deleting && <ConfirmDialog title={`Delete ${c.name}?`} danger confirmLabel="Delete character" message="This removes the character and all of their progress and build data."
        onCancel={() => setDeleting(false)} onConfirm={() => { deleteCharacter(c.id); notify(`${c.name} was deleted.`); window.location.hash = '#/characters'; }} />}
    </div>
  );
}
