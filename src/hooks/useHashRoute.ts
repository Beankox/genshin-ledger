import { useEffect, useState } from 'react';

const read = () => window.location.hash.replace(/^#/, '') || '/';

/** Tiny hash router: "#/characters", "#/character/hu-tao", ... Survives page refresh. */
export function useHashRoute() {
  const [path, setPath] = useState(read);
  useEffect(() => {
    const on = () => { setPath(read()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}
