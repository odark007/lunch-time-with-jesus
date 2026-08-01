"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import VinylPlayer from "@/components/VinylPlayer";
import PlayerRing from "@/components/PlayerRing";
import PlayerControls from "@/components/PlayerControls";
import YouTubeAudio from "@/components/YouTubeAudio";
import NoteModal from "@/components/NoteModal";

// Note: generateMetadata is now in a separate file (or would be if this were a Server Component)
// But in Next.js App Router, we can't have 'use client' and generateMetadata in the same file.
// We should use a separate layout.js or a server page that imports this client component.

function formatTime(seconds) {
// ... existing code ...
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerPage({ params }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [continuousPlay, setContinuousPlay] = useState(true);
  const [noteOpen, setNoteOpen] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    fetch(`/api/entries/${params.date}`)
      .then((res) => res.json())
      .then(setData);
    setNoteOpen(false);
  }, [params.date]);

  function handlePlayPause() {
    if (isPlaying) playerRef.current?.pause();
    else playerRef.current?.play();
  }

  function handleShare() {
    const url = `${window.location.origin}/player/${params.date}`;
    if (navigator.share) {
      navigator.share({ title: data?.entry?.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    }
  }

  function handleEnded() {
    if (continuousPlay && data?.next) {
      router.push(`/player/${data.next.slug}`);
    }
  }

  function goPrev() {
    if (data?.previous) router.push(`/player/${data.previous.slug}`);
  }

  function goNext() {
    if (data?.next) router.push(`/player/${data.next.slug}`);
  }

  if (!data) return null;

  if (data.error) {
    return (
      <main className="player-page loading">
        <p>No word was found for this date.</p>
        <style jsx>{`
          .loading {
            background: var(--color-black);
            color: var(--color-cream);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </main>
    );
  }

  const { entry, previous, next } = data;
  const progress = duration ? current / duration : 0;

  return (
    <main className="player-page">
      <button className="back" aria-label="Back" onClick={() => router.push("/")}>
        &larr;
      </button>

      <YouTubeAudio
        ref={playerRef}
        videoId={entry.youtubeId}
        onStateChange={(state) => {
          // 1 = playing, 2 = paused, 0 = ended (YT.PlayerState)
          setIsPlaying(state === 1);
          if (state === 0) handleEnded();
        }}
        onTimeUpdate={(c, d) => {
          setCurrent(c);
          setDuration(d);
        }}
      />

      <div className="disc-wrap">
        <VinylPlayer isPlaying={isPlaying} />
        <PlayerRing progress={progress} />
      </div>

      <div className="time-row">
        <span>{formatTime(current)}</span>
        <span>-{formatTime(duration - current)}</span>
      </div>

      <div className="meta">
        <span className="channel">{entry.channel}</span>
        <h1 className="title">{entry.title}</h1>
      </div>

      <PlayerControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onShare={handleShare}
        onPrev={goPrev}
        onNext={goNext}
        hasPrev={!!previous}
        hasNext={!!next}
        continuousPlay={continuousPlay}
        onToggleContinuous={() => setContinuousPlay((v) => !v)}
      />

      {entry.note?.trim() && (
        <button className="note-cta" type="button" onClick={() => setNoteOpen(true)}>
          View note
        </button>
      )}

      <NoteModal open={noteOpen} entry={entry} onClose={() => setNoteOpen(false)} />

      <style jsx>{`
        .player-page {
          background: radial-gradient(circle at 50% 20%, #17171a, var(--color-black) 70%);
          min-height: 100vh;
          color: var(--color-cream);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 24px 32px;
        }
        .back {
          align-self: flex-start;
          background: none;
          border: none;
          color: var(--color-cream);
          font-size: 1.5rem;
          padding: 8px;
        }
        .disc-wrap {
          position: relative;
          width: min(280px, 70vw);
          height: min(280px, 70vw);
          margin-top: 12px;
        }
        .time-row {
          display: flex;
          justify-content: space-between;
          width: min(280px, 70vw);
          font-family: var(--font-mono);
          font-size: 0.8rem;
          opacity: 0.7;
          margin-top: 8px;
        }
        .meta {
          text-align: center;
          margin: 28px 0 24px;
        }
        .channel {
          display: block;
          font-size: 0.85rem;
          opacity: 0.65;
          margin-bottom: 6px;
        }
        .title {
          font-size: 1.5rem;
        }
        .note-cta {
          margin-top: 20px;
          background: rgba(244, 236, 216, 0.08);
          color: var(--color-cream);
          border: 1px solid rgba(244, 236, 216, 0.22);
          padding: 11px 18px;
          border-radius: 999px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .disc-wrap :global(.vinyl-canvas) {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </main>
  );
}
