import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "entries.json");

// Reads the JSON file fresh on every call (request-time, not build-time).
export function getAllEntries() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const entries = JSON.parse(raw);
  return entries.sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
}

export function getLatestEntries(count = 5) {
  return getAllEntries().slice(0, count);
}

export function getEntryByDate(date) {
  return getAllEntries().find((entry) => entry.date === date) || null;
}

// Returns the previous and next entries in chronological order relative to a date.
export function getAdjacentEntries(date) {
  const all = getAllEntries().sort((a, b) => (a.date > b.date ? 1 : -1)); // oldest first
  const index = all.findIndex((entry) => entry.date === date);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null
  };
}

export function extractYoutubeId(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}
