import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const DATA_PATH = path.join(process.cwd(), "data", "entries.json");
const FIXED_CHANNEL = "Lunch Time With Jesus";

export const runtime = "nodejs";

function extractYoutubeId(url) {
  const match = (url || "").match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : "";
}

function normalizeNoteText(rawText) {
  const normalized = String(rawText || "")
    .replace(/\r\n?/g, "\n")
    .trim();

  if (!normalized) return "";

  if (/\n\s*\n/.test(normalized)) {
    const lines = normalized.split("\n");
    const paragraphs = [];
    let currentParagraph = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        if (currentParagraph.length) {
          paragraphs.push(currentParagraph.join(" "));
          currentParagraph = [];
        }
        return;
      }

      currentParagraph.push(trimmedLine);
    });

    if (currentParagraph.length) {
      paragraphs.push(currentParagraph.join(" "));
    }

    return paragraphs.join("\n\n");
  }

  const collapsed = normalized.replace(/\s+/g, " ").trim();
  const sentences =
    collapsed.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g)?.map((part) => part.trim()) || [];

  if (sentences.length < 3) return collapsed;

  const paragraphs = [];
  let current = [];
  let currentLength = 0;

  sentences.forEach((sentence) => {
    const nextLength = currentLength + (currentLength ? 1 : 0) + sentence.length;
    current.push(sentence);
    currentLength = nextLength;

    if (current.length >= 3 || currentLength >= 420) {
      paragraphs.push(current.join(" "));
      current = [];
      currentLength = 0;
    }
  });

  if (current.length) {
    paragraphs.push(current.join(" "));
  }

  return paragraphs.join("\n\n");
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (process.env.ADMIN_PASSWORD && body.adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const normalizedDate = (body.date || "").trim();
    const normalizedYoutubeUrl = (body.youtubeUrl || "").trim();

    if (!normalizedDate || !normalizedYoutubeUrl) {
      return NextResponse.json(
        { error: "date and youtubeUrl are required" },
        { status: 400 }
      );
    }

    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const entries = JSON.parse(raw);

    const existingIndex = entries.findIndex((entry) => entry.date === normalizedDate);
    const existingEntry = existingIndex >= 0 ? entries[existingIndex] : null;
    const sameYoutubeUrl = existingEntry && existingEntry.youtubeUrl === normalizedYoutubeUrl;

    const resolvedYoutubeId =
      (body.youtubeId || "").trim() ||
      extractYoutubeId(normalizedYoutubeUrl) ||
      (sameYoutubeUrl ? existingEntry.youtubeId || "" : "");

    if (!resolvedYoutubeId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const resolvedTitle =
      (body.title || "").trim() ||
      (sameYoutubeUrl ? existingEntry.title || "" : "") ||
      "Untitled";

    const resolvedThumbnail =
      (body.thumbnail || "").trim() ||
      (sameYoutubeUrl ? existingEntry.thumbnail || "" : "") ||
      `https://i.ytimg.com/vi/${resolvedYoutubeId}/hqdefault.jpg`;

    const newEntry = {
      date: normalizedDate,
      slug: normalizedDate,
      youtubeUrl: normalizedYoutubeUrl,
      youtubeId: resolvedYoutubeId,
      title: resolvedTitle,
      channel: FIXED_CHANNEL,
      thumbnail: resolvedThumbnail,
      note: normalizeNoteText(body.note)
    };

    if (existingIndex >= 0) {
      entries[existingIndex] = newEntry;
    } else {
      entries.push(newEntry);
    }

    fs.writeFileSync(DATA_PATH, `${JSON.stringify(entries, null, 2)}\n`, "utf-8");

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Save failed" },
      { status: 500 }
    );
  }
}
