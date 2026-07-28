// POST /.netlify/functions/save-entry
// Body: { adminPassword, date, youtubeUrl, title, channel, youtubeId, thumbnail, note }
// Adds a new entry or updates an existing one (matched by date), then commits
// the updated data/entries.json back to GitHub so the site picks it up.

const API_BASE = "https://api.github.com";
const FILE_PATH = "data/entries.json";
const FIXED_CHANNEL = "Lunch Time With Jesus";

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

async function githubRequest(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      ...options.headers
    }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${body}`);
  }
  return res.json();
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const body = JSON.parse(event.body || "{}");

  if (body.adminPassword !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const { date, youtubeUrl, title, youtubeId, thumbnail, note } = body;
  const normalizedDate = (date || "").trim();
  const normalizedYoutubeUrl = (youtubeUrl || "").trim();

  if (!normalizedDate || !normalizedYoutubeUrl) {
    return { statusCode: 400, body: JSON.stringify({ error: "date and youtubeUrl are required" }) };
  }

  try {
    const contentsUrl = `${API_BASE}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${FILE_PATH}?ref=${process.env.GITHUB_BRANCH}`;
    const file = await githubRequest(contentsUrl);
    const entries = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));

    const existingIndex = entries.findIndex((e) => e.date === normalizedDate);
    const existingEntry = existingIndex >= 0 ? entries[existingIndex] : null;
    const sameYoutubeUrl =
      existingEntry && existingEntry.youtubeUrl === normalizedYoutubeUrl;

    const resolvedYoutubeId =
      (youtubeId || "").trim() ||
      extractYoutubeId(normalizedYoutubeUrl) ||
      (sameYoutubeUrl ? existingEntry.youtubeId || "" : "");
    const resolvedTitle =
      (title || "").trim() || (sameYoutubeUrl ? existingEntry.title || "" : "") || "Untitled";
    const resolvedChannel = FIXED_CHANNEL;
    const resolvedThumbnail =
      (thumbnail || "").trim() ||
      (sameYoutubeUrl ? existingEntry.thumbnail || "" : "") ||
      (resolvedYoutubeId ? `https://i.ytimg.com/vi/${resolvedYoutubeId}/hqdefault.jpg` : "");
    const resolvedNote = normalizeNoteText(note);

    const newEntry = {
      date: normalizedDate,
      slug: normalizedDate,
      youtubeUrl: normalizedYoutubeUrl,
      youtubeId: resolvedYoutubeId,
      title: resolvedTitle,
      channel: resolvedChannel,
      thumbnail: resolvedThumbnail,
      note: resolvedNote
    };

    if (existingIndex >= 0) {
      entries[existingIndex] = newEntry;
    } else {
      entries.push(newEntry);
    }

    const putUrl = `${API_BASE}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${FILE_PATH}`;
    const content = Buffer.from(JSON.stringify(entries, null, 2)).toString("base64");
    await githubRequest(putUrl, {
      method: "PUT",
      body: JSON.stringify({
        message: `Add/update entry for ${normalizedDate}`,
        content,
        sha: file.sha,
        branch: process.env.GITHUB_BRANCH
      })
    });

    return { statusCode: 200, body: JSON.stringify({ success: true, entry: newEntry }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
