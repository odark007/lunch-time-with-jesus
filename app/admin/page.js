"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import MenuOverlay from "@/components/MenuOverlay";
import AdminForm from "@/components/AdminForm";
import AdminTable from "@/components/AdminTable";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [entries, setEntries] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState("manage");
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  function loadEntries() {
    fetch("/api/entries")
      .then((res) => res.json())
      .then((data) => setEntries(data.entries || []));
  }

  useEffect(() => {
    if (authed) loadEntries();
  }, [authed]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextView = params.get("view") === "curator" ? "curator" : "manage";
    setView(nextView);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, searchDate]);

  const latestTwoEntries = useMemo(() => entries.slice(0, 2), [entries]);

  const filteredCuratorEntries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return entries.filter((entry) => {
      const titleMatch = term ? entry.title?.toLowerCase().includes(term) : true;
      const dateMatch = searchDate ? entry.date === searchDate : true;
      return titleMatch && dateMatch;
    });
  }, [entries, searchDate, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCuratorEntries.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const curatorPageEntries = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    return filteredCuratorEntries.slice(start, start + pageSize);
  }, [clampedPage, filteredCuratorEntries]);

  function handleSelectView(nextView) {
    setView(nextView);
    setMenuOpen(false);
    const next = nextView === "curator" ? "?view=curator" : "";
    window.history.replaceState({}, "", `/admin${next}`);
  }

  function handleSaved() {
    setEditingEntry(null);
    loadEntries();
  }

  const adminNavLinks = [
    {
      label: "Manage Entries",
      href: "/admin",
      onClick: (e) => {
        e.preventDefault();
        handleSelectView("manage");
      }
    },
    {
      label: "Curator",
      href: "/admin?view=curator",
      onClick: (e) => {
        e.preventDefault();
        handleSelectView("curator");
      }
    },
    { label: "Home", href: "/" }
  ];

  const headerTitle = view === "curator" ? "Curator" : "Manage entries";

  function handleLogin(e) {
    e.preventDefault();
    // The real check happens server-side in the Netlify function on save/delete.
    // This client-side gate only controls UI visibility, per the agreed
    // low-security approach — do not treat this as a real access boundary.
    setPassword(input);
    setAuthed(true);
    setError("");
  }

  if (!authed) {
    return (
      <main className="gate">
        <form onSubmit={handleLogin}>
          <h1>Admin</h1>
          <input
            type="password"
            placeholder="Password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Enter</button>
        </form>

        <style jsx>{`
          .gate {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-cream);
          }
          form {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 260px;
          }
          h1 {
            text-align: center;
            margin-bottom: 8px;
          }
          input {
            padding: 12px;
            border: 1px solid var(--color-cream-dim);
            border-radius: var(--radius-sm);
          }
          button {
            background: var(--color-green);
            color: var(--color-white);
            border: none;
            padding: 12px;
            border-radius: var(--radius-sm);
            font-weight: 600;
          }
          .error {
            color: var(--color-red);
            font-size: 0.85rem;
          }
        `}</style>
      </main>
    );
  }

  return (
    <>
      <Header onMenuClick={() => setMenuOpen(true)} title={headerTitle} />
      <MenuOverlay
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={adminNavLinks}
        showSocials={false}
      />

      <main className="admin container">
        {view === "manage" ? (
          <>
            <AdminForm
              password={password}
              onSaved={handleSaved}
              editingEntry={editingEntry}
              onCancelEdit={() => setEditingEntry(null)}
            />
            <section className="card">
              <h2>Latest entries</h2>
              <AdminTable
                entries={latestTwoEntries}
                password={password}
                onChanged={loadEntries}
                onEdit={setEditingEntry}
              />
            </section>
          </>
        ) : (
          <>
            <section className="card filters">
              <label>
                Search title
                <input
                  type="search"
                  placeholder="Search by title"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </label>
            </section>

            <section className="card">
              <h2>Results</h2>
              <AdminTable
                entries={curatorPageEntries}
                password={password}
                onChanged={loadEntries}
                onEdit={setEditingEntry}
                emptyText="No entries match your filters."
              />

              {filteredCuratorEntries.length > pageSize && (
                <div className="pagination">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={clampedPage === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {clampedPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={clampedPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <style jsx>{`
        .admin {
          padding-bottom: 60px;
          padding-top: 8px;
        }
        .card {
          background: var(--color-white);
          border-radius: var(--radius-md);
          padding: 20px;
          margin-bottom: 24px;
        }
        h2 {
          margin: 0 0 14px;
          font-size: 1rem;
        }
        .filters {
          display: grid;
          gap: 12px;
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
        .pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 14px;
          font-size: 0.85rem;
        }
        .pagination button {
          background: var(--color-cream);
          color: var(--color-green-deep);
          border: 1px solid var(--color-cream-dim);
          border-radius: var(--radius-sm);
          padding: 8px 10px;
        }
        .pagination button:disabled {
          opacity: 0.55;
        }
      `}</style>
    </>
  );
}
