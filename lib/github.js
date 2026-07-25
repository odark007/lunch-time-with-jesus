// Commits an updated data/entries.json file to the GitHub repo using the
// GitHub Contents API. Requires these environment variables set in Netlify:
//   GITHUB_TOKEN  - a personal access token with repo write access
//   GITHUB_OWNER  - e.g. "yourusername"
//   GITHUB_REPO   - e.g. "lunch-time-with-jesus"
//   GITHUB_BRANCH - e.g. "main"

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

export async function getCurrentFile() {
  const url = `${API_BASE}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${FILE_PATH}?ref=${process.env.GITHUB_BRANCH}`;
  const data = await githubRequest(url);
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { entries: JSON.parse(content), sha: data.sha };
}

export async function commitEntries(entries, sha, commitMessage) {
  const url = `${API_BASE}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${FILE_PATH}`;
  const content = Buffer.from(JSON.stringify(entries, null, 2)).toString("base64");
  return githubRequest(url, {
    method: "PUT",
    body: JSON.stringify({
      message: commitMessage,
      content,
      sha,
      branch: process.env.GITHUB_BRANCH
    })
  });
}
