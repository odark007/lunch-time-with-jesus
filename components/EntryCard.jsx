"use client";

import Link from "next/link";

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

export default function EntryCard({ entry }) {
  async function handleShare(e) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/player/${entry.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: entry.title, url });
      } catch {
        // user cancelled share — no action needed
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    }
  }

  return (
    <Link href={`/player/${entry.slug}`} className="card">
      <div className="text">
        <span className="date">{formatDate(entry.date)}</span>
        <h2 className="title">{entry.title}</h2>
      </div>
      <button className="share" aria-label="Share" onClick={handleShare}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 0 6c.35 0 .68-.06 1-.17l-6.05 3.5a3 3 0 1 0 0 3.34L16 20.17A3 3 0 1 0 15 17a2.98 2.98 0 0 0-1 .17l-6.05-3.5a3 3 0 0 0 0-2.34L14 8.17c.32.11.65.17 1 .17Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </button>

      <style jsx>{`
        .card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px;
          background: var(--color-white);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-cream-dim);
        }
        .text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .date {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-green);
        }
        .title {
          font-size: 1.15rem;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .share {
          flex-shrink: 0;
          background: var(--color-cream);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-green-deep);
        }
      `}</style>
    </Link>
  );
}
