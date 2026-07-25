"use client";

export default function PlayerRing({ progress = 0 }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg className="ring" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="rgba(200,38,42,0.25)"
        strokeWidth="2"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="#c8262a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
      />
      <style jsx>{`
        .ring {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        circle {
          transition: stroke-dashoffset 0.25s linear;
        }
      `}</style>
    </svg>
  );
}
