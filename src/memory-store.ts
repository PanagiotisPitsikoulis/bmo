import { join } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

const MEMORY_DIR = join(import.meta.dir, "..", "bmo_memory");
const FACTS_FILE = join(MEMORY_DIR, "facts.json");
const NOTES_FILE = join(MEMORY_DIR, "notes.json");
const JOURNAL_FILE = join(MEMORY_DIR, "journal.json");

export interface MemoryEntry {
  id: string;
  content: string;
  category: "fact" | "note" | "journal";
  tags: string[];
  createdAt: string;
}

function ensureDir(): void {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true });
}

function fileForCategory(category: MemoryEntry["category"]): string {
  switch (category) {
    case "fact": return FACTS_FILE;
    case "note": return NOTES_FILE;
    case "journal": return JOURNAL_FILE;
  }
}

function loadFile(path: string): MemoryEntry[] {
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return [];
  }
}

export function saveMemory(
  content: string,
  category: MemoryEntry["category"] = "note",
  tags: string[] = [],
): MemoryEntry {
  ensureDir();
  const file = fileForCategory(category);
  const entries = loadFile(file);
  const entry: MemoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    content,
    category,
    tags,
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  writeFileSync(file, JSON.stringify(entries, null, 2));
  return entry;
}

export function recallMemories(query: string, limit: number = 5): MemoryEntry[] {
  ensureDir();
  const all = [
    ...loadFile(FACTS_FILE),
    ...loadFile(NOTES_FILE),
    ...loadFile(JOURNAL_FILE),
  ];

  if (!query || query.trim() === "") return all.slice(-limit);

  const words = query.toLowerCase().split(/\s+/);
  const scored = all.map((entry) => {
    const text = `${entry.content} ${entry.tags.join(" ")}`.toLowerCase();
    let score = 0;
    for (const word of words) {
      if (text.includes(word)) score++;
    }
    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entry);
}

export function getAllMemories(): MemoryEntry[] {
  ensureDir();
  return [
    ...loadFile(FACTS_FILE),
    ...loadFile(NOTES_FILE),
    ...loadFile(JOURNAL_FILE),
  ];
}

export function getMemorySummary(): string {
  const all = getAllMemories();
  if (all.length === 0) return "";

  const facts = all.filter((m) => m.category === "fact");
  const notes = all.filter((m) => m.category === "note");

  let summary = "\n\n## B-MO'S MEMORIES\n";

  if (facts.length > 0) {
    summary += "Things B-MO knows about you:\n";
    for (const f of facts.slice(-10)) {
      summary += `- ${f.content}\n`;
    }
  }

  if (notes.length > 0) {
    summary += "B-MO's notes:\n";
    for (const n of notes.slice(-5)) {
      summary += `- ${n.content}\n`;
    }
  }

  return summary;
}
