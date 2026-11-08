import { useRef, useState } from 'react';
import { Download, RotateCcw, Undo2, Upload } from 'lucide-react';
import type { Ledger } from '../hooks/useLedger';
import type { LedgerState } from '../types';
import { normalizeState } from '../lib/ledger';
import { downloadJson, loadBackup, saveBackup, storageSize } from '../lib/storage';
import { ConfirmDialog } from '../components/Modal';
import { Panel } from '../components/Controls';

export function Data({ ledger, notify }: { ledger: Ledger; notify: (m: string, error?: boolean) => void }) {
  const { state, replaceAll, resetAll } = ledger;
  const [pending, setPending] = useState<LedgerState | null>(null);
  const [resetting, setResetting] = useState(false);
  const [backup, setBackup] = useState(loadBackup);
  const file = useRef<HTMLInputElement>(null);
  const keepCurrent = () => { saveBackup(state); setBackup(state); };
  const tracked = Object.values(state.progress).filter((p) => p.owned).length;

  const onFile = async (f?: File) => {
    if (!f) return;
    try {
      const parsed = normalizeState(JSON.parse(await f.text()));
      if (!parsed) return notify('That file is not a Character Ledger export.', true);
      setPending(parsed);
    } catch { notify('That file could not be read as JSON.', true); }
    if (file.current) file.current.value = '';
  };

  return (
    <div className="page">
      <h1>Data</h1>
      <p className="lead">Everything is saved in this browser. Export a backup before clearing your browser data or switching devices.</p>
      <div className="two">
        <Panel title="Back up" icon={<Download size={18} />}>
          <p className="muted">Download your collection, builds and notes as a JSON file.</p>
          <button className="btn primary" onClick={() => { downloadJson(state); notify('Backup downloaded.'); }}><Download size={16} /> Export JSON</button>
        </Panel>
        <Panel title="Restore" icon={<Upload size={18} />}>
          <p className="muted">Load a file you exported earlier. This replaces your current data.</p>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <button className="btn" onClick={() => file.current?.click()}><Upload size={16} /> Import JSON</button>
        </Panel>
      </div>
      {backup && (
        <Panel title="Undo" icon={<Undo2 size={18} />} className="mt">
          <p className="muted">Your data from before the last import or reset is still stored in this browser ({Object.values(backup.progress).filter((p) => p.owned).length} owned characters).</p>
          <button className="btn" onClick={() => { replaceAll(backup); notify('Previous data restored.'); }}><Undo2 size={16} /> Restore previous data</button>
        </Panel>
      )}
      <Panel title="Reset" icon={<RotateCcw size={18} />} className="mt">
        <p className="muted">{tracked} owned characters and {state.custom.length} custom characters are saved ({storageSize()} KB). Resetting erases all progress, builds, notes, custom characters and edits.</p>
        <button className="btn danger" onClick={() => setResetting(true)}><RotateCcw size={16} /> Reset all data</button>
      </Panel>

      {pending && <ConfirmDialog title="Replace your data?" confirmLabel="Import and replace"
        message={`This file contains ${Object.values(pending.progress).filter((p) => p.owned).length} owned characters and ${pending.custom.length} custom characters. Your current data will be replaced.`}
        onCancel={() => setPending(null)} onConfirm={() => { keepCurrent(); replaceAll(pending); setPending(null); notify('Backup imported.'); }} />}
      {resetting && <ConfirmDialog title="Reset all data?" danger confirmLabel="Erase everything"
        message="This permanently deletes your collection progress, builds, notes and custom characters from this browser. Export a backup first if you might want them back."
        onCancel={() => setResetting(false)} onConfirm={() => { keepCurrent(); resetAll(); setResetting(false); notify('All data was reset.'); }} />}
    </div>
  );
}
