"use client";

import { useRouter } from "next/navigation";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function toDateKey(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export default function CalendarGrid({ year, month, entryDates }) {
  const router = useRouter();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="grid">
      {WEEKDAYS.map((w, i) => (
        <div key={i} className="weekday">
          {w}
        </div>
      ))}
      {cells.map((day, i) => {
        if (!day) return <div key={`empty-${i}`} />;
        const key = toDateKey(year, month, day);
        const hasContent = entryDates.has(key);
        return (
          <button
            key={key}
            className={`day ${hasContent ? "active" : "disabled"}`}
            disabled={!hasContent}
            onClick={() => hasContent && router.push(`/player/${key}`)}
          >
            {day}
          </button>
        );
      })}

      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }
        .weekday {
          text-align: center;
          font-size: 0.7rem;
          opacity: 0.5;
          padding-bottom: 6px;
          font-family: var(--font-mono);
        }
        .day {
          aspect-ratio: 1;
          border-radius: 50%;
          border: none;
          font-family: var(--font-body);
          font-size: 0.9rem;
        }
        .day.active {
          background: var(--color-green);
          color: var(--color-white);
          font-weight: 600;
        }
        .day.disabled {
          background: none;
          color: var(--color-ink);
          opacity: 0.25;
        }
      `}</style>
    </div>
  );
}
