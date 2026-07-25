"use client";

import { useState } from "react";

function extractYoutubeId(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function AdminForm({ password, onSaved }) {
  const [url, setUrl] = useState("");
  const [date, setDate] = useState("");
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleUrlBlur() {
    const id = extractYoutubeId(url);
    if (!id) {
      setPreview(null);
      return;
    }
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
      );
      const data = await res.json();
      setPreview({
        youtubeId: id,
        title: data.title,
        channel: data.author_name,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
      });
    } catch {
      setError("Could not fetch video details. Check the URL.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!preview || !date) {
      setError("Enter a valid YouTube URL and a date.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/.netlify/functions/save-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: password,
          date,
          youtubeUrl: url,
          youtubeId: preview.youtubeId,
          title: preview.title,
          channel: preview.channel,
          thumbnail: preview.thumbnail
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setUrl("");
      setDate("");
      setPreview(null);
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        YouTube URL
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleUrlBlur}
          placeholder="https://youtube.com/watch?v=..."
          required
        />
      </label>

      <label>
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      {preview && (
        <div className="preview">
          <img src={preview.thumbnail} alt="" />
          <div>
            <strong>{preview.title}</strong>
            <span>{preview.channel}</span>
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save entry"}
      </button>

      <style jsx>{`
        .form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: var(--color-white);
          padding: 20px;
          border-radius: var(--radius-md);
          margin-bottom: 24px;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        input {
          padding: 10px 12px;
          border: 1px solid var(--color-cream-dim);
          border-radius: var(--radius-sm);
          font-size: 1rem;
        }
        .preview {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .preview img {
          width: 80px;
          border-radius: var(--radius-sm);
        }
        .preview div {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 0.85rem;
        }
        .error {
          color: var(--color-red);
          font-size: 0.85rem;
        }
        button {
          background: var(--color-green);
          color: var(--color-white);
          border: none;
          padding: 12px;
          border-radius: var(--radius-sm);
          font-weight: 600;
        }
        button:disabled {
          opacity: 0.6;
        }
      `}</style>
    </form>
  );
}
