import { getBook } from "./bible-books";

export type Verse = { verse: number; text: string };

export type Translation = {
  id: string;
  label: string;
  name: string;
  /** id on bible.helloao.org used as a backup source */
  backup?: string;
};

export const TRANSLATIONS: Translation[] = [
  { id: "kjv", label: "KJV", name: "King James Version", backup: "eng_kjv" },
  { id: "web", label: "WEB", name: "World English Bible", backup: "eng_web" },
  { id: "asv", label: "ASV", name: "American Standard Version", backup: "eng_asv" },
  { id: "bbe", label: "BBE", name: "Bible in Basic English", backup: "eng_bbe" },
  { id: "oeb-us", label: "OEB", name: "Open English Bible" },
];

const ONE_CHAPTER_VERSE_COUNTS: Record<string, number> = {
  Obadiah: 21,
  Philemon: 25,
  "2 John": 13,
  "3 John": 14,
  Jude: 25,
};

const CACHE_PREFIX = "ngn-bible-v2:";

function cacheKey(translation: string, book: string, chapter: number) {
  return `${CACHE_PREFIX}${translation}:${book}:${chapter}`;
}

export function readCachedChapter(translation: string, book: string, chapter: number): Verse[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(cacheKey(translation, book, chapter));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Verse[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedChapter(translation: string, book: string, chapter: number, verses: Verse[]) {
  if (typeof window === "undefined" || verses.length === 0) return;
  try {
    window.localStorage.setItem(cacheKey(translation, book, chapter), JSON.stringify(verses));
  } catch {
    // Storage full — drop the oldest cached chapters and move on.
    try {
      const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
      keys.slice(0, 40).forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
  }
}

async function getJson(url: string, ms: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fromPrimary(translation: string, book: string, chapter: number): Promise<Verse[]> {
  const ref = encodeURIComponent(`${book} ${chapter}`);
  const data = (await getJson(`https://bible-api.com/${ref}?translation=${translation}`, 10_000)) as {
    verses?: { verse: number; text: string }[];
  };
  return (data.verses ?? []).map((v) => ({ verse: v.verse, text: v.text.replace(/\s+/g, " ").trim() }));
}

function isCompleteChapter(book: string, chapter: number, verses: Verse[]) {
  if (verses.length === 0) return false;
  const ordered = verses.every((verse, index) => verse.verse === index + 1 && verse.text.trim().length > 0);
  if (!ordered) return false;
  const expected = chapter === 1 ? ONE_CHAPTER_VERSE_COUNTS[book] : undefined;
  return expected ? verses.length === expected : true;
}

type AoNode = { type?: string; number?: number; content?: unknown[] };

async function fromBackup(backupId: string, book: string, chapter: number): Promise<Verse[]> {
  const meta = getBook(book);
  if (!meta) return [];
  const data = (await getJson(
    `https://bible.helloao.org/api/${backupId}/${meta.id}/${chapter}.json`,
    10_000,
  )) as { chapter?: { content?: AoNode[] } };
  const content = data.chapter?.content ?? [];
  const verses: Verse[] = [];
  for (const node of content) {
    if (node?.type !== "verse" || typeof node.number !== "number") continue;
    const text = (node.content ?? [])
      .map((part) =>
        typeof part === "string" ? part : typeof part === "object" && part && "text" in part ? String((part as { text: unknown }).text) : "",
      )
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) verses.push({ verse: node.number, text });
  }
  return verses;
}

/** Loads a chapter: cache first, then primary source, then a backup source. */
export async function loadChapter(translation: string, book: string, chapter: number): Promise<Verse[]> {
  const cached = readCachedChapter(translation, book, chapter);
  if (cached) return cached;

  const t = TRANSLATIONS.find((x) => x.id === translation) ?? TRANSLATIONS[0];
  let lastError: unknown;

  // bible-api.com interprets one-chapter references as a single verse. Use the
  // structured chapter source first for these books so all verses are returned.
  if (t.backup && ONE_CHAPTER_VERSE_COUNTS[book] && chapter === 1) {
    try {
      const verses = await fromBackup(t.backup, book, chapter);
      if (isCompleteChapter(book, chapter, verses)) {
        writeCachedChapter(translation, book, chapter, verses);
        return verses;
      }
    } catch (error) {
      lastError = error;
    }
  }

  try {
    const verses = await fromPrimary(t.id, book, chapter);
    if (isCompleteChapter(book, chapter, verses)) {
      writeCachedChapter(translation, book, chapter, verses);
      return verses;
    }
  } catch (error) {
    lastError = error;
  }

  if (t.backup) {
    try {
      const verses = await fromBackup(t.backup, book, chapter);
      if (isCompleteChapter(book, chapter, verses)) {
        writeCachedChapter(translation, book, chapter, verses);
        return verses;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Chapter unavailable");
}

export function chapterQueryOptions(translation: string, book: string, chapter: number) {
  return {
    queryKey: ["bible", translation, book, chapter] as const,
    queryFn: () => loadChapter(translation, book, chapter),
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
    retry: 0,
  };
}
