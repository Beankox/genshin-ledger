// Downloads a portrait for every character into public/portraits/<character-id>.png
// Source: Enka.Network icons (https://enka.network/ui/...) + Enka's public character list.
// - Never overwrites a file you already put there (use --force to replace everything).
// - Never fails your build: if you are offline or something changes, it just prints a warning.
// - Runs once, then remembers (node_modules/.portraits-fetched). Re-run with:  npm run portraits -- --force
import { mkdir, access, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'portraits');
const MARKER = path.join(ROOT, 'node_modules', '.portraits-fetched');
const STORE = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/';
const ICON = 'https://enka.network/ui/';
const force = process.argv.includes('--force');

// Same id rules as src/data/characters.ts
const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'character';

const exists = (p) => access(p).then(() => true, () => false);
const getJson = async (url) => {
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
  return r.json();
};

async function main() {
  if (!force && (await exists(MARKER))) return;
  await mkdir(OUT, { recursive: true });

  const [chars, loc] = await Promise.all([getJson(STORE + 'characters.json'), getJson(STORE + 'loc.json')]);
  const en = loc.en ?? loc;

  // Build the list of { id, iconKey }
  const jobs = new Map();
  for (const c of Object.values(chars)) {
    const side = c.SideIconName;
    if (!side) continue;
    const iconKey = side.replace('Side_', '');
    let id;
    if (/Player(Boy|Girl)/.test(iconKey)) id = 'traveler';
    else {
      const name = en[String(c.NameTextMapHash)];
      if (!name) continue;
      id = slugify(name);
    }
    if (!jobs.has(id)) jobs.set(id, iconKey);
  }

  const todo = [];
  for (const [id, key] of jobs) if (force || !(await exists(path.join(OUT, `${id}.png`)))) todo.push([id, key]);

  let ok = 0;
  const failed = [];
  const queue = [...todo];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const [id, key] = queue.shift();
        try {
          const r = await fetch(`${ICON}${key}.png`, { signal: AbortSignal.timeout(30000) });
          if (!r.ok || !(r.headers.get('content-type') || '').startsWith('image')) throw new Error(`HTTP ${r.status}`);
          await writeFile(path.join(OUT, `${id}.png`), Buffer.from(await r.arrayBuffer()));
          ok++;
        } catch {
          failed.push(id);
        }
      }
    }),
  );

  console.log(`[portraits] downloaded ${ok}, skipped ${jobs.size - todo.length} already present` + (failed.length ? `, missing: ${failed.sort().join(', ')}` : ''));
  if (!failed.length) {
    await mkdir(path.dirname(MARKER), { recursive: true });
    await writeFile(MARKER, new Date().toISOString());
  }
}

main().catch((e) => console.warn('[portraits] skipped:', e.message));
