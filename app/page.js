"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import MenuOverlay from "@/components/MenuOverlay";
import EntryCard from "@/components/EntryCard";

export default function HomePage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navigatingToPlayer, setNavigatingToPlayer] = useState(false);

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
                disabled={navigatingToPlayer}
              />
            </div>
          ))}
        </div>
      </div>

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
          padding-bottom: 40px;
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
