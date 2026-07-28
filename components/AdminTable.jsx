"use client";

export default function AdminTable({
  entries,
  password,
  onChanged,
  onDeleted,
  onEdit,
  emptyText = "No entries found."
}) {
  async function handleDelete(date) {
    if (!confirm(`Delete entry for ${date}?`)) return;
    let res = await fetch("/.netlify/functions/delete-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminPassword: password, date })
    });

    // In plain `next dev`, Netlify functions are not mounted. Fall back to a local API route.
    if (res.status === 404) {
      res = await fetch("/api/admin/delete-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: password, date })
      });
    }

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : { error: await res.text() };

    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }

    const deletedDate = data.deletedDate || date;
    onDeleted?.(deletedDate);
    onChanged?.();
  }

  return (
    <>
      {entries.length ? (
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
                  <div className="actions">
                    <button
                      type="button"
                      className="icon edit"
                      aria-label={`Edit entry for ${entry.date}`}
                      onClick={() => onEdit?.(entry)}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      className="icon delete"
                      aria-label={`Delete entry for ${entry.date}`}
                      onClick={() => handleDelete(entry.date)}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">
                        delete
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="empty">{emptyText}</p>
      )}

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
          vertical-align: middle;
        }
        td:last-child,
        th:last-child {
          width: 90px;
          text-align: right;
        }
        .actions {
          display: inline-flex;
          gap: 6px;
        }
        .icon {
          background: var(--color-cream);
          border: 1px solid var(--color-cream-dim);
          color: var(--color-green-deep);
          border-radius: 999px;
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        .icon.delete {
          color: var(--color-red);
        }
        .material-symbols-outlined {
          font-size: 18px;
          line-height: 1;
        }
        .empty {
          background: var(--color-white);
          border-radius: var(--radius-md);
          padding: 16px;
          margin: 0;
          color: var(--color-ink);
          opacity: 0.75;
          font-size: 0.9rem;
        }
      `}</style>
    </>
  );
}
