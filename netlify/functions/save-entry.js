// POST /.netlify/functions/save-entry
// Body: { adminPassword, date, youtubeUrl, title, channel, youtubeId, thumbnail, note }
// Adds a new entry or updates an existing one (matched by date), then commits
// the updated data/entries.json back to GitHub so the site picks it up.

const API_BASE = "https://api.github.com";
const FILE_PATH = "data/entries.json";

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

  const { date, youtubeUrl, title, channel, youtubeId, thumbnail, note } = body;
  if (!date || !youtubeUrl) {
    return { statusCode: 400, body: JSON.stringify({ error: "date and youtubeUrl are required" }) };
  }

  try {
    const contentsUrl = `${API_BASE}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${FILE_PATH}?ref=${process.env.GITHUB_BRANCH}`;
    const file = await githubRequest(contentsUrl);
    const entries = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));

    const newEntry = {
      date,
      slug: date,
      youtubeUrl,
      youtubeId: youtubeId || "",
      title: title || "Untitled",
      channel: channel || "Lunch Time With Jesus",
      thumbnail: thumbnail || "",
      note: note || ""
    };

    const existingIndex = entries.findIndex((e) => e.date === date);
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
        message: `Add/update entry for ${date}`,
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
