import { TALENT_BOOKS } from '../data/materials';

export const BOOKS = TALENT_BOOKS.flatMap((t) => t.books.map((b) => ({ ...b, nation: t.nation })));
const stripBook = (s: string) => s.trim().toLowerCase().replace(/^(guide to|teachings of|philosophies of)\s+/, '');
/** Finds a talent book from whatever was typed, e.g. "Freedom" or "Guide to Freedom". */
export const findBook = (s: string) => BOOKS.find((b) => b.name.toLowerCase() === stripBook(s));
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** Every book can be farmed on Sunday. Books with no schedule listed are treated as always available. */
export const farmableOn = (days: string | undefined, today: string) => !days || today === 'Sun' || days.split('/').includes(today);
