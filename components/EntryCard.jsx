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

export default function EntryCard({ entry, onOpenPlayer, disabled = false }) {
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

  function handlePlay(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!onOpenPlayer || disabled) return;
    onOpenPlayer(entry.slug);
  }

  function handleOpen(e) {
    if (!onOpenPlayer || disabled) {
      if (disabled) e.preventDefault();
      return;
    }
    e.preventDefault();
    onOpenPlayer(entry.slug);
  }

  return (
    <Link
      href={`/player/${entry.slug}`}
      className={`card${disabled ? " card-disabled" : ""}`}
      aria-disabled={disabled}
      onClick={handleOpen}
    >
      <div className="text">
        <span className="date">{formatDate(entry.date)}</span>
        <h2 className="title">{entry.title}</h2>
      </div>
      <div className="actions">
        <button className="share" aria-label="Share" onClick={handleShare}>
          <span className="share-icon" aria-hidden="true">
            share
          </span>
        </button>

        <button className="play" aria-label="Play message" onClick={handlePlay}>
          <span className="play-icon" aria-hidden="true">
            play_arrow
          </span>
        </button>
      </div>

      <style jsx>{`
        .card {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 14px;
          padding: 20px;
          background: var(--color-white);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-cream-dim);
        }
        .card-disabled {
          pointer-events: none;
          opacity: 0.92;
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
          margin: 0;
          white-space: normal;
          word-break: normal;
          overflow-wrap: normal;
        }
        .actions {
          position: relative;
          min-height: 40px;
        }
        .share {
          position: absolute;
          left: 0;
          top: 0;
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
        .play {
          position: absolute;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
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
        .share-icon {
          font-family: "Material Symbols Outlined";
          font-size: 20px;
          line-height: 1;
        }
        .play-icon {
          font-family: "Material Symbols Outlined";
          font-size: 22px;
          line-height: 1;
        }
      `}</style>
    </Link>
  );
}
