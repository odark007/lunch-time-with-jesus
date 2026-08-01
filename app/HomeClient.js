"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import MenuOverlay from "@/components/MenuOverlay";
import EntryCard from "@/components/EntryCard";
import NoteModal from "@/components/NoteModal";

export default function HomePage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navigatingToPlayer, setNavigatingToPlayer] = useState(false);
  const [noteEntry, setNoteEntry] = useState(null);

  useEffect(() => {
    fetch("/api/entries")
      .then((res) => res.json())
      .then((data) => {
        setEntries((data.entries || []).slice(0, 5));
        setLoading(false);
      });
  }, []);

  function handleOpenPlayer(slug) {
    if (navigatingToPlayer) return;
    setNavigatingToPlayer(true);
    router.push(`/player/${slug}`);
  }

  return (
    <main>
      <Header onMenuClick={() => setMenuOpen(true)} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="container">
        <p className="intro">Today&apos;s word, and the days before it.</p>

        {loading && <p className="status">Loading...</p>}
        {!loading && entries.length === 0 && (
          <p className="status">No entries yet. Check back soon.</p>
        )}

        <div className="list">
          {entries.map((entry) => (
            <div className="entrySection" key={entry.date}>
              <EntryCard
                entry={entry}
                onOpenPlayer={handleOpenPlayer}
                onViewNote={setNoteEntry}
                disabled={navigatingToPlayer}
              />
            </div>
          ))}
        </div>

        <div className="listenAgainCta">
          <p className="listenAgainPrompt">missed a date?</p>
          <button
            className="listenAgainButton"
            type="button"
            onClick={() => router.push("/calendar")}
            aria-label="listen again in calendar"
          >
            listen again
          </button>
        </div>
      </div>

      <NoteModal open={!!noteEntry} entry={noteEntry} onClose={() => setNoteEntry(null)} />

      {navigatingToPlayer && (
        <div className="navSpinnerOverlay" role="status" aria-live="polite">
          <span className="navSpinner" aria-hidden="true" />
        </div>
      )}

      <style jsx>{`
        .intro {
          color: var(--color-green-deep);
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1.1rem;
          margin: 0 0 20px;
        }
        .status {
          color: var(--color-ink);
          opacity: 0.6;
        }
        .list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: 28px;
        }
        .listenAgainCta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding-bottom: 40px;
        }
        .listenAgainPrompt {
          margin: 0;
          color: var(--color-green-deep);
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1rem;
          opacity: 0.9;
        }
        .listenAgainButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 182px;
          padding: 13px 20px;
          border: 2px solid var(--color-green-deep);
          border-radius: 999px;
          background: var(--color-green);
          color: var(--color-white);
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          text-transform: lowercase;
          cursor: pointer;
          box-shadow: 0 5px 0 rgba(18, 51, 29, 0.28);
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
        }
        .listenAgainButton:hover {
          transform: translateY(-1px);
          box-shadow: 0 7px 14px rgba(18, 51, 29, 0.28);
          filter: saturate(1.05);
        }
        .listenAgainButton:focus-visible {
          outline: 2px solid var(--color-gold);
          outline-offset: 2px;
        }
        .listenAgainButton:active {
          transform: translateY(2px);
          box-shadow: 0 3px 0 rgba(18, 51, 29, 0.28);
        }
        .entrySection {
          position: relative;
          padding-bottom: 12px;
        }
        .entrySection:not(:last-child)::after {
          content: "";
          display: block;
          width: 68%;
          height: 1px;
          margin: 12px auto 0;
          background: var(--color-green-deep);
          opacity: 0.2;
        }
        .navSpinnerOverlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 40;
        }
        .navSpinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(18, 51, 29, 0.2);
          border-top-color: var(--color-green-deep);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
