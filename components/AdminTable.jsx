"use client";

export default function AdminTable({ entries, password, onChanged }) {
  async function handleDelete(date) {
    if (!confirm(`Delete entry for ${date}?`)) return;
    const res = await fetch("/.netlify/functions/delete-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminPassword: password, date })
    });
    if (res.ok) onChanged?.();
    else alert("Delete failed");
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Title</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.date}>
            <td>{entry.date}</td>
            <td>{entry.title}</td>
            <td>
              <button onClick={() => handleDelete(entry.date)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>

      <style jsx>{`
        .table {
          width: 100%;
          border-collapse: collapse;
          background: var(--color-white);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        th,
        td {
          text-align: left;
          padding: 12px;
          font-size: 0.85rem;
          border-bottom: 1px solid var(--color-cream-dim);
        }
        button {
          background: none;
          border: none;
          color: var(--color-red);
          font-weight: 600;
          font-size: 0.8rem;
        }
      `}</style>
    </table>
  );
}
