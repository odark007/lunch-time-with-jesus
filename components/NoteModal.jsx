"use client";

import { useEffect } from "react";

function toPdfSafeText(text) {
  return String(text || "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "");
}

function escapePdfText(text) {
  return toPdfSafeText(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(text, maxChars) {
  const paragraphs = toPdfSafeText(text).split(/\r?\n/);
  const lines = [];

  paragraphs.forEach((paragraph, index) => {
    if (!paragraph) {
      lines.push("");
      return;
    }

    const words = paragraph.split(/\s+/);
    let current = "";

    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxChars && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    });

    if (current) lines.push(current);
    if (index < paragraphs.length - 1) lines.push("");
  });

  return lines;
}

function buildPdfBytes({ title, subtitle, body }) {
  const pageWidth = 612;
  const pageHeight = 792;
  const left = 72;
  const top = 72;
  const bottom = 72;
  const titleSize = 18;
  const subtitleSize = 11;
  const bodySize = 12;
  const lineHeight = 16;
  const encoder = new TextEncoder();
  const bodyLines = wrapText(body, 74);
  const pages = [];

  const firstPageCapacity = Math.max(1, Math.floor((pageHeight - top - bottom - 72) / lineHeight));
  const laterPageCapacity = Math.max(1, Math.floor((pageHeight - top - bottom) / lineHeight));

  let remaining = bodyLines.slice();
  const firstPageBody = remaining.splice(0, firstPageCapacity);
  pages.push({ title, subtitle, lines: firstPageBody });

  while (remaining.length) {
    pages.push({ title: "", subtitle: "", lines: remaining.splice(0, laterPageCapacity) });
  }

  const objects = [];
  const pageObjects = [];

  const makeContentStream = (page, pageNumber) => {
    const lines = [];
    let y = pageHeight - top - titleSize;

    if (pageNumber === 1) {
      lines.push(`BT /F2 ${titleSize} Tf 1 0 0 1 ${left} ${y} Tm (${escapePdfText(page.title)}) Tj ET`);
      y -= 24;

      if (page.subtitle) {
        lines.push(`BT /F1 ${subtitleSize} Tf 1 0 0 1 ${left} ${y} Tm (${escapePdfText(page.subtitle)}) Tj ET`);
        y -= 22;
      }

      lines.push(`BT /F1 ${bodySize} Tf 1 0 0 1 ${left} ${y} Tm`);
    } else {
      lines.push(`BT /F1 ${bodySize} Tf 1 0 0 1 ${left} ${pageHeight - top - bodySize} Tm`);
    }

    page.lines.forEach((line) => {
      lines.push(`(${escapePdfText(line)}) Tj`);
      lines.push(`0 -${lineHeight} Td`);
    });

    lines.push("ET");

    return lines.join("\n");
  };

  pages.forEach((page, index) => {
    const content = makeContentStream(page, index + 1);
    const contentBytes = encoder.encode(content);
    const contentObjectNumber = 5 + index * 2;
    const pageObjectNumber = contentObjectNumber + 1;

    objects.push({
      number: contentObjectNumber,
      body: `<< /Length ${contentBytes.length} >>\nstream\n${content}\nendstream`
    });

    pageObjects.push({
      number: pageObjectNumber,
      body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`
    });
  });

  const totalPages = pages.length;
  const pagesKids = pageObjects.map((page) => `${page.number} 0 R`).join(" ");

  objects.unshift(
    { number: 1, body: `<< /Type /Catalog /Pages 2 0 R >>` },
    { number: 2, body: `<< /Type /Pages /Kids [ ${pagesKids} ] /Count ${totalPages} >>` },
    { number: 3, body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>` },
    { number: 4, body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>` }
  );
  objects.push(...pageObjects);

  const orderedObjects = [...objects].sort((a, b) => a.number - b.number);

  const chunks = ["%PDF-1.4\n%Note PDF\n"];
  const offsets = [0];
  let byteOffset = encoder.encode(chunks[0]).length;

  orderedObjects.forEach((obj) => {
    const chunk = `${obj.number} 0 obj\n${obj.body}\nendobj\n`;
    offsets.push(byteOffset);
    chunks.push(chunk);
    byteOffset += encoder.encode(chunk).length;
  });

  const xrefOffset = byteOffset;
  let xref = `xref\n0 ${orderedObjects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });

  const trailer = `trailer\n<< /Size ${orderedObjects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(xref, trailer);

  return encoder.encode(chunks.join(""));
}

function downloadNotePdf(entry) {
  const title = entry.title || "Note";
  const subtitle = [entry.channel, entry.date].filter(Boolean).join(" | ");
  const bytes = buildPdfBytes({ title, subtitle, body: entry.note || "" });
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${(entry.slug || entry.date || "note").replace(/[^a-z0-9-]+/gi, "-")}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function NoteModal({ open, entry, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !entry) return null;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Entry note" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="close" aria-label="Close note" onClick={onClose}>
          &times;
        </button>

        <p className="eyebrow">{entry.channel || "Lunch Time With Jesus"}</p>
        <h2>{entry.title || "Note"}</h2>
        <p className="meta">{entry.date}</p>
        <div className="body">{entry.note}</div>

        <div className="actions">
          <button type="button" className="secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="primary" onClick={() => downloadNotePdf(entry)}>
            Download PDF
          </button>
        </div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          z-index: 120;
          background: rgba(11, 11, 12, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .sheet {
          position: relative;
          width: min(560px, 100%);
          max-height: min(78vh, 720px);
          overflow: auto;
          background: var(--color-cream);
          color: var(--color-ink);
          border-radius: var(--radius-lg);
          padding: 24px 22px 20px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
        }
        .close {
          position: absolute;
          top: 10px;
          right: 10px;
          border: none;
          background: none;
          font-size: 2rem;
          line-height: 1;
          color: var(--color-green-deep);
        }
        .eyebrow {
          margin: 0 32px 6px 0;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.76rem;
          color: var(--color-green);
        }
        h2 {
          margin: 0;
          font-family: var(--font-display);
          font-size: 1.6rem;
          color: var(--color-green-deep);
        }
        .meta {
          margin: 6px 0 18px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.7;
        }
        .body {
          white-space: pre-wrap;
          line-height: 1.7;
          font-size: 1rem;
          color: var(--color-ink);
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
        }
        button {
          border-radius: var(--radius-sm);
          padding: 11px 16px;
          border: none;
          font-weight: 600;
        }
        .secondary {
          background: transparent;
          border: 1px solid var(--color-cream-dim);
          color: var(--color-green-deep);
        }
        .primary {
          background: var(--color-green);
          color: var(--color-white);
        }
      `}</style>
    </div>
  );
}