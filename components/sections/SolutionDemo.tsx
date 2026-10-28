"use client";

import { useEffect, useRef, useState } from "react";
import { solutionDemos } from "@/lib/content/gamcs";

/**
 * One pillar's demo loop in an app window (client, 2026-10-23): a silent
 * 15–21s zoom tour of the client's own Power BI / Excel recording. A clip
 * that joins two dashboards has `chapters`, and the window title follows
 * whichever one is on screen (client, 2026-10-28).
 *
 * Plays only while on screen (IntersectionObserver) and never under
 * prefers-reduced-motion, where the poster stands in. `loop` is off while
 * the accordion is auto-advancing so `onEnded` can hand over to the next
 * pillar at the clip's natural end instead of a timer cutting it mid-move.
 */
export default function SolutionDemo({
  slug,
  loop,
  onEnded,
  onPlayable,
}: {
  slug: string;
  loop: boolean;
  onEnded?: () => void;
  /** Reports whether this clip is actually playing (false on error). */
  onPlayable?: (ok: boolean) => void;
}) {
  const demo = solutionDemos[slug];
  const ref = useRef<HTMLVideoElement>(null);
  const [title, setTitle] = useState(demo?.title);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onPlayable?.(false);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => onPlayable?.(false));
        else v.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
    // A new slug mounts a new element (keyed by the parent).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!demo) return null;
  const src = `/video/solutions/${slug}`;

  return (
    <figure className="svd" data-slug={slug}>
      <figcaption className="svd-bar">
        <span className="svd-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="svd-title">{title}</span>
      </figcaption>
      <div className="svd-screen">
        <video
          ref={ref}
          className="svd-video"
          src={`${src}.mp4`}
          poster={`${src}.webp`}
          muted
          playsInline
          preload="metadata"
          loop={loop}
          aria-label={demo.label}
          onPlaying={() => onPlayable?.(true)}
          onError={() => onPlayable?.(false)}
          onTimeUpdate={
            demo.chapters
              ? (e) => {
                  const t = e.currentTarget.currentTime;
                  setTitle(demo.chapters!.reduce((cur, c) => (t >= c.at ? c.title : cur), demo.title));
                }
              : undefined
          }
          onEnded={onEnded}
        />
      </div>
    </figure>
  );
}
