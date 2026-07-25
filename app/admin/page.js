"use client";

import { useEffect, useState } from "react";
import AdminForm from "@/components/AdminForm";
import AdminTable from "@/components/AdminTable";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [entries, setEntries] = useState([]);

  function loadEntries() {
    fetch("/api/entries")
      .then((res) => res.json())
      .then((data) => setEntries(data.entries || []));
  }

  useEffect(() => {
    if (authed) loadEntries();
  }, [authed]);

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
    <main className="admin">
      <h1>Manage entries</h1>
      <AdminForm password={password} onSaved={loadEntries} />
      <AdminTable entries={entries} password={password} onChanged={loadEntries} />

      <style jsx>{`
        .admin {
          max-width: 720px;
          margin: 0 auto;
          padding: 24px 20px 60px;
        }
        h1 {
          margin-bottom: 20px;
        }
      `}</style>
    </main>
  );
}
