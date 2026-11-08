import { useCallback, useEffect, useRef, useState } from 'react';
import { Database, LayoutDashboard, UserCheck, UserMinus, Users, TriangleAlert } from 'lucide-react';
import { useLedger } from './hooks/useLedger';
import { useHashRoute } from './hooks/useHashRoute';
import { Dashboard } from './pages/Dashboard';
import { Collection } from './pages/Collection';
import { CharacterDetail } from './pages/CharacterDetail';
import { Data } from './pages/Data';
import { ErrorBoundary } from './components/ErrorBoundary';

const safeDecode = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
const titleFor = (path: string) =>
  path === '/characters' ? 'All characters' : path === '/owned' ? 'Owned' : path === '/unowned' ? 'Unowned' : path === '/data' ? 'Data' : path.startsWith('/character/') ? 'Character' : 'Dashboard';

export default function App() {
  const ledger = useLedger();
  const path = useHashRoute();
  const [toast, setToast] = useState<{ msg: string; error: boolean } | null>(null);
  const notify = useCallback((msg: string, error = false) => setToast({ msg, error }), []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); } }, [toast]);

  const firstRender = useRef(true);
  useEffect(() => {
    document.title = `${titleFor(path)} · Character Ledger`;
    if (firstRender.current) { firstRender.current = false; return; }
    const h1 = document.querySelector<HTMLElement>('main h1');
    if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); } // helps screen readers notice the new page
  }, [path]);

  const owned = ledger.characters.filter((c) => ledger.progressOf(c.id).owned).length;
  const total = ledger.characters.length;
  const nav = [
    { href: '#/', label: 'Dashboard', icon: <LayoutDashboard size={17} />, active: path === '/' },
    { href: '#/characters', label: 'All characters', icon: <Users size={17} />, n: total, active: path === '/characters' || path.startsWith('/character/') },
    { href: '#/owned', label: 'Owned', icon: <UserCheck size={17} />, n: owned, active: path === '/owned' },
    { href: '#/unowned', label: 'Unowned', icon: <UserMinus size={17} />, n: total - owned, active: path === '/unowned' },
    { href: '#/data', label: 'Data', icon: <Database size={17} />, active: path === '/data' },
  ];

  let page: React.ReactNode;
  if (ledger.loading) page = <div className="page" aria-busy="true"><div className="skel title" /><div className="skel block" /><div className="grid">{Array.from({ length: 8 }, (_, i) => <div key={i} className="skel card" />)}</div></div>;
  else if (path === '/characters') page = <Collection key="all" ledger={ledger} mode="all" />;
  else if (path === '/owned') page = <Collection key="owned" ledger={ledger} mode="owned" />;
  else if (path === '/unowned') page = <Collection key="unowned" ledger={ledger} mode="unowned" />;
  else if (path === '/data') page = <Data ledger={ledger} notify={notify} />;
  else if (path.startsWith('/character/')) page = <CharacterDetail key={path} ledger={ledger} id={safeDecode(path.slice(11))} notify={notify} />;
  else page = <Dashboard ledger={ledger} />;

  return (
    <div className="app">
      <aside className="side">
        <div className="brand">Character Ledger</div>
        <div className="sub">A Traveler’s collection</div>
        <nav aria-label="Main">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className={n.active ? 'on' : ''} aria-current={n.active ? 'page' : undefined}>
              <span>{n.icon}{n.label}</span>{n.n !== undefined && !ledger.loading && <small>{n.n}</small>}
            </a>
          ))}
        </nav>
      </aside>
      <main>
        {ledger.saveFailed && <div className="banner" role="alert"><TriangleAlert size={16} /> Your browser would not save the latest changes (storage may be full or disabled). Export a backup from the Data page.</div>}
        <ErrorBoundary key={path}>{page}</ErrorBoundary>
      </main>
      {toast && <div className={`toast ${toast.error ? 'bad' : ''}`} role="status">{toast.msg}</div>}
    </div>
  );
}
