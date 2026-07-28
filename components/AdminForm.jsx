"use client";

import { useEffect, useState } from "react";

const FIXED_CHANNEL = "Lunch Time With Jesus";

function extractYoutubeId(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function normalizeNoteText(rawText) {
  const normalized = String(rawText || "")
    .replace(/\r\n?/g, "\n")
    .trim();

  if (!normalized) return "";

  // If the author already separated paragraphs, preserve that structure.
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

  // For one long pasted block, create readable paragraph chunks.
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

export default function AdminForm({ password, onSaved, editingEntry, onCancelEdit }) {
  const [url, setUrl] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!editingEntry;
  const existingYoutubeId = editingEntry?.youtubeId || "";
  const existingTitle = editingEntry?.title || "";
  const existingThumbnail = editingEntry?.thumbnail || "";

  useEffect(() => {
    if (!editingEntry) return;
    setUrl(editingEntry.youtubeUrl || "");
    setDate(editingEntry.date || "");
    setTitle(editingEntry.title || "");
    setNote(editingEntry.note || "");
    setPreview({
      youtubeId: editingEntry.youtubeId,
      title: editingEntry.title,
      channel: editingEntry.channel || FIXED_CHANNEL,
      thumbnail: editingEntry.thumbnail
    });
    setError("");
  }, [editingEntry]);

  function resetForm() {
    setUrl("");
    setDate("");
    setTitle("");
    setNote("");
    setPreview(null);
  }

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
      const nextThumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

      setPreview({
        youtubeId: id,
        title: data.title,
        channel: FIXED_CHANNEL,
        thumbnail: nextThumbnail
      });

      setTitle((current) => current || data.title || "");
    } catch {
      setError("Could not fetch video details. Check the URL.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!date) {
      setError("Enter a date.");
      return;
    }

    const resolvedYoutubeId =
      extractYoutubeId(url) || preview?.youtubeId || existingYoutubeId;
    if (!resolvedYoutubeId) {
      setError("Enter a valid YouTube URL.");
      return;
    }

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const resolvedThumbnail =
      preview?.thumbnail ||
      existingThumbnail ||
      `https://i.ytimg.com/vi/${resolvedYoutubeId}/hqdefault.jpg`;
    const normalizedNote = normalizeNoteText(note);
    const payload = {
      adminPassword: password,
      date,
      youtubeUrl: url,
      youtubeId: resolvedYoutubeId,
      title: title.trim() || preview?.title || existingTitle,
      channel: FIXED_CHANNEL,
      thumbnail: resolvedThumbnail,
      note: normalizedNote
    };

    setSaving(true);
    setError("");
    try {
      let res = await fetch("/.netlify/functions/save-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // In plain `next dev`, Netlify functions are not mounted. Fall back to a local API route.
      if (res.status === 404) {
        res = await fetch("/api/admin/save-entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: await res.text() };

      if (!res.ok) throw new Error(data.error || "Save failed");
      resetForm();
      onSaved?.(data.entry);
      onCancelEdit?.();
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
          disabled={isEditMode}
          required
        />
      </label>

      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Message title"
          required
        />
      </label>

      <label>
        Note
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add the note text for this entry"
          rows={6}
        />
      </label>

      {preview && (
        <div className="preview">
          <img src={preview.thumbnail || existingThumbnail} alt="" />
          <div>
            <strong>{title || preview.title}</strong>
            <span>{FIXED_CHANNEL}</span>
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <div className="actions">
        {isEditMode && (
          <button
            type="button"
            className="secondary"
            onClick={() => {
              onCancelEdit?.();
              resetForm();
              setError("");
            }}
          >
            Cancel
          </button>
        )}
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditMode ? "Update entry" : "Save entry"}
        </button>
      </div>

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
        textarea {
          padding: 10px 12px;
          border: 1px solid var(--color-cream-dim);
          border-radius: var(--radius-sm);
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          min-height: 120px;
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
        .actions {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .secondary {
          background: var(--color-cream);
          color: var(--color-green-deep);
          border: 1px solid var(--color-cream-dim);
        }
      `}</style>
    </form>
  );
}
