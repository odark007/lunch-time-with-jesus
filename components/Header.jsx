"use client";

export default function Header({ onMenuClick }) {
  return (
    <header className="header">
      <span className="header-title">Lunch Time With Jesus</span>
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
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          max-width: var(--max-width);
          margin: 0 auto;
        }
        .header-title {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--color-green-deep);
        }
        .hamburger {
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
