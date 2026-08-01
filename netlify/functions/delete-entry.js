// POST /.netlify/functions/delete-entry
// Body: { adminPassword, date }

const API_BASE = "https://api.github.com";
const FILE_PATH = "data/entries.json";

function requiredEnvMissing() {
  const required = ["GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO", "GITHUB_BRANCH", "ADMIN_PASSWORD"];
  return required.filter((key) => !process.env[key]);
}

function formatGithubError(err) {
  const message = String(err?.message || "");

  if (message.includes("GitHub API error 401")) {
    return "GitHub token is invalid or expired. Update GITHUB_TOKEN in Netlify environment variables.";
  }

  if (message.includes("GitHub API error 403")) {
    return "GitHub token does not have permission to update this repository. Use a token with repository Contents write access for the configured owner/repo.";
  }

  if (message.includes("GitHub API error 404")) {
    return "GitHub repository or file not found for current configuration. Verify GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH, and data/entries.json path.";
  }

  return message || "Delete failed";
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

  const missingEnv = requiredEnvMissing();
  if (missingEnv.length) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `Server is missing required environment variables: ${missingEnv.join(", ")}`
      })
    };
  }

  const body = JSON.parse(event.body || "{}");

  if (body.adminPassword !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const { date } = body;
  const normalizedDate = (date || "").trim();
  if (!normalizedDate) {
    return { statusCode: 400, body: JSON.stringify({ error: "date is required" }) };
  }

  try {
    const contentsUrl = `${API_BASE}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${FILE_PATH}?ref=${process.env.GITHUB_BRANCH}`;
    const file = await githubRequest(contentsUrl);
    const entries = JSON.parse(Buffer.from(file.content, "base64").toString("utf-8"));

    const filtered = entries.filter((e) => e.date !== normalizedDate);

    const putUrl = `${API_BASE}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${FILE_PATH}`;
    const content = Buffer.from(JSON.stringify(filtered, null, 2)).toString("base64");
    await githubRequest(putUrl, {
      method: "PUT",
      body: JSON.stringify({
        message: `Delete entry for ${normalizedDate}`,
        content,
        sha: file.sha,
        branch: process.env.GITHUB_BRANCH
      })
    });

    return { statusCode: 200, body: JSON.stringify({ success: true, deletedDate: normalizedDate }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: formatGithubError(err) }) };
  }
};
