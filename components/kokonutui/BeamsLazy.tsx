"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const BeamsBackground = dynamic(() => import("./beams-background"), { ssr: false });

/**
 * Canvas beams are decorative and sit well below the fold.
 *
 * `dynamic()` alone only code-splits the chunk — it is still fetched and
 * hydrated as soon as this component mounts, which is during the hero entrance
 * and competes with it for the main thread. Mounting is therefore held until the
 * section is near the viewport, so the entrance runs on an idle thread.
 */
export default function BeamsLazy() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref} className="beams-slot">{show && <BeamsBackground intensity="subtle" />}</div>;
}
