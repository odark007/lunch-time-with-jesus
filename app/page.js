"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MenuOverlay from "@/components/MenuOverlay";
import EntryCard from "@/components/EntryCard";

export default function HomePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/entries")
      .then((res) => res.json())
      .then((data) => {
        setEntries((data.entries || []).slice(0, 5));
        setLoading(false);
      });
  }, []);

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
            <EntryCard key={entry.date} entry={entry} />
          ))}
        </div>
      </div>

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
      `}</style>
    </main>
  );
}
