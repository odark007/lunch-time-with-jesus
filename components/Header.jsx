"use client";

export default function Header({ onMenuClick, title = "Lunch Time With Jesus" }) {
  return (
    <header className="header">
      <span className="header-title">{title}</span>
      <button
        className="hamburger"
        aria-label="Open menu"
        onClick={onMenuClick}
      >
        <span />
        <span />
        <span />
      </button>

      <style jsx>{`
        .header {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 20px;
          max-width: var(--max-width);
          margin: 0 auto;
        }
        .header-title {
          grid-column: 2;
          justify-self: center;
          text-align: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--color-green-deep);
        }
        .hamburger {
          grid-column: 3;
          justify-self: end;
          background: none;
          border: none;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .hamburger span {
          display: block;
          width: 24px;
          height: 2px;
          background: var(--color-ink);
          border-radius: 2px;
        }
      `}</style>
    </header>
  );
}
