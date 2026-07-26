"use client";

import Link from "next/link";

const DEFAULT_LINKS = [
  { label: "Home", href: "/" },
  { label: "Calendar", href: "/calendar" }
];

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "YouTube", href: "https://youtube.com" },
  { label: "TikTok", href: "https://tiktok.com" }
];

export default function MenuOverlay({
  open,
  onClose,
  links = DEFAULT_LINKS,
  showSocials = true
}) {
  if (!open) return null;

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <button className="close" aria-label="Close menu" onClick={onClose}>
        &times;
      </button>

      <nav className="links">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => {
              item.onClick?.(e);
              if (e.defaultPrevented) return;
              onClose?.();
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {showSocials && (
        <div className="socials">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      )}

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: var(--color-green-deep);
          color: var(--color-white);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 40px;
          z-index: 100;
        }
        .close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: var(--color-white);
          font-size: 2rem;
          line-height: 1;
        }
        .links {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          font-family: var(--font-display);
          font-size: 1.75rem;
        }
        .socials {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          font-family: var(--font-body);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.85;
        }
        @media (min-width: 768px) {
          .socials {
            flex-direction: row;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}
