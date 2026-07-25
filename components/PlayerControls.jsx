"use client";

export default function PlayerControls({
  isPlaying,
  onPlayPause,
  onShare,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  continuousPlay,
  onToggleContinuous
}) {
  return (
    <div className="controls">
      <button className="icon-btn" aria-label="Share" onClick={onShare}>
        <span className="icon-glyph" aria-hidden="true">
          share
        </span>
      </button>

      <button
        className="icon-btn"
        aria-label="Previous"
        onClick={onPrev}
        disabled={!hasPrev}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 5h2v14H6zM20 5v14l-11-7z" />
        </svg>
      </button>

      <button className="play-btn" aria-label={isPlaying ? "Pause" : "Play"} onClick={onPlayPause}>
        {isPlaying ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 5l13 7-13 7z" />
          </svg>
        )}
      </button>

      <button
        className="icon-btn"
        aria-label="Next"
        onClick={onNext}
        disabled={!hasNext}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
        </svg>
      </button>

      <button
        className={`icon-btn toggle ${continuousPlay ? "active" : ""}`}
        aria-label="Toggle continuous play"
        onClick={onToggleContinuous}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 7h13l-2.5-2.5M20 17H7l2.5 2.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <style jsx>{`
        .controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 0 8px;
        }
        .icon-btn {
          background: none;
          border: none;
          color: var(--color-cream-dim);
          padding: 10px;
          opacity: 0.7;
        }
        .icon-btn:disabled {
          opacity: 0.25;
        }
        .icon-glyph {
          font-family: "Material Symbols Outlined";
          font-size: 20px;
          line-height: 1;
        }
        .icon-btn.toggle.active {
          opacity: 1;
          color: var(--color-red);
        }
        .play-btn {
          background: var(--color-cream);
          color: var(--color-black);
          border: none;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
