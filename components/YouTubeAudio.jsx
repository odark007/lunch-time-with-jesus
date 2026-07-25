"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

let apiLoadPromise = null;

function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
  return apiLoadPromise;
}

// Note: the video track still loads over the network (YouTube's iframe does
// not offer an audio-only mode), but it is visually hidden via CSS so only
// the audio is perceived by the listener. See project notes on the
// audio-only constraint for why a true audio-only stream isn't possible
// without a backend media proxy.
const YouTubeAudio = forwardRef(function YouTubeAudio(
  { videoId, onStateChange, onTimeUpdate },
  ref
) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  useImperativeHandle(ref, () => ({
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    getCurrentTime: () => playerRef.current?.getCurrentTime() || 0,
    getDuration: () => playerRef.current?.getDuration() || 0
  }));

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onReady: (e) => e.target.playVideo(),
          onStateChange: (e) => {
            onStateChange?.(e.data);
            if (e.data === window.YT.PlayerState.PLAYING) {
              intervalRef.current = setInterval(() => {
                const current = playerRef.current.getCurrentTime();
                const duration = playerRef.current.getDuration();
                onTimeUpdate?.(current, duration);
              }, 500);
            } else {
              clearInterval(intervalRef.current);
            }
          }
        }
      });
    });

    return () => {
      cancelled = true;
      clearInterval(intervalRef.current);
      playerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return (
    <div className="yt-hidden">
      <div ref={containerRef} />
      <style jsx>{`
        .yt-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
});

export default YouTubeAudio;
