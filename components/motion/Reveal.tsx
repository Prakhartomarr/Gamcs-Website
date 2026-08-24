"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Stagger index — multiplies the delay for sibling reveals. */
  index?: number;
  className?: string;
  /** Distance in px to travel upward into place. */
  y?: number;
  as?: "div" | "section" | "article" | "li";
};

/**
 * Motion-driven scroll reveal, replacing the CSS `.reveal` +
 * IntersectionObserver pair on rebuilt sections.
 *
 * Reduced motion is handled on a SINGLE code path on purpose. Branching to a
 * different element (`if (reduce) return <div/>`) reuses the same DOM node, so
 * the inline `opacity: 0` Motion had already written stayed behind and left the
 * whole page invisible for reduced-motion users. Here `initial={false}` skips
 * the hidden state outright and `animate` actively drives the resting state,
 * which also clears any style written before the preference resolved.
 */
export default function Reveal({
  children,
  index = 0,
  className,
  y = 22,
  as = "div",
}: Props) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={reduce ? { opacity: 1, y: 0 } : undefined}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={
        reduce
          ? { duration: 0 }
          : {
              duration: 0.62,
              delay: index * 0.08,
              ease: [0.22, 0.61, 0.36, 1],
            }
      }
    >
      {children}
    </MotionTag>
  );
}
