"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CalendarGrid from "@/components/CalendarGrid";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarPage() {
  const [entries, setEntries] = useState([]);
  const [cursor, setCursor] = useState(null); // { year, month }
  const [bounds, setBounds] = useState(null); // { min: {year,month}, max: {year,month} }

  useEffect(() => {
    fetch("/api/entries")
      .then((res) => res.json())
      .then((data) => {
        const list = data.entries || [];
        setEntries(list);

        if (list.length > 0) {
          const dates = list.map((e) => new Date(e.date + "T00:00:00"));
          const min = dates.reduce((a, b) => (a < b ? a : b));
          const max = dates.reduce((a, b) => (a > b ? a : b));
          setBounds({
            min: { year: min.getFullYear(), month: min.getMonth() },
            max: { year: max.getFullYear(), month: max.getMonth() }
          });
          setCursor({ year: max.getFullYear(), month: max.getMonth() });
        }
      });
  }, []);

  if (!cursor || !bounds) {
    return (
      <main className="calendar-page">
        <p>Loading...</p>
      </main>
    );
  }

  const entryDates = new Set(entries.map((e) => e.date));

  const atMin = cursor.year === bounds.min.year && cursor.month === bounds.min.month;
  const atMax = cursor.year === bounds.max.year && cursor.month === bounds.max.month;

  function shiftMonth(delta) {
    setCursor((c) => {
      let month = c.month + delta;
      let year = c.year;
      if (month < 0) {
        month = 11;
        year -= 1;
      } else if (month > 11) {
        month = 0;
        year += 1;
      }
      return { year, month };
    });
  }

  return (
    <main className="calendar-page">
      <div className="top">
        <Link href="/" className="back">
          &larr; Home
        </Link>
      </div>

      <h1>Calendar</h1>

      <div className="nav">
        <button onClick={() => shiftMonth(-1)} disabled={atMin}>
          &lsaquo;
        </button>
        <span>
          {MONTH_NAMES[cursor.month]} {cursor.year}
        </span>
        <button onClick={() => shiftMonth(1)} disabled={atMax}>
          &rsaquo;
        </button>
      </div>

      <CalendarGrid year={cursor.year} month={cursor.month} entryDates={entryDates} />

      <style jsx>{`
        .calendar-page {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 20px;
        }
        .back {
          font-size: 0.9rem;
          color: var(--color-green-deep);
        }
        h1 {
          margin: 20px 0 16px;
        }
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          font-family: var(--font-display);
          font-size: 1.1rem;
        }
        .nav button {
          background: none;
          border: none;
          font-size: 1.5rem;
          padding: 4px 12px;
          color: var(--color-green-deep);
        }
        .nav button:disabled {
          opacity: 0.25;
        }
      `}</style>
    </main>
  );
}
