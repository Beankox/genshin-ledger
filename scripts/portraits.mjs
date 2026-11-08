// Lists public/portraits/*.png into public/portraits/index.json so the app only requests images that exist
// (no wall of 404s). Runs automatically before `npm run dev` and `npm run build`.
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';

const dir = new URL('../public/portraits/', import.meta.url);
mkdirSync(dir, { recursive: true });
const ids = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png')).map((f) => f.slice(0, -4)).sort();
writeFileSync(new URL('index.json', dir), JSON.stringify(ids));
console.log(`portraits: ${ids.length} found`);
