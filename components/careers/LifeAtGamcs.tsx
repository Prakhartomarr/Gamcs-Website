import { careers } from "@/lib/content/gamcs";

/**
 * Life at GAMCS (client, 2026-10-23): offsites, festivals and day outs as a
 * bento wall above the careers page's closing ask. One wide video tile and
 * five photos; on phones it becomes a swipeable, snap-scrolled row.
 *
 * Media is not in yet: a tile without `src` renders a labelled placeholder,
 * so the layout is final and swapping in a file is a one-line content edit.
 * The video plays muted and looped (decorative), and only autoplays where
 * motion is allowed — reduced motion shows its poster.
 */
export default function LifeAtGamcs() {
  const { life } = careers;

  return (
    <section className="cr-life" aria-labelledby="cr-life-h">
      <div className="container">
        <div className="cr-life-head reveal">
          <div className="cr-caps">{life.eyebrow}</div>
          <h2 id="cr-life-h" className="fin-h2">
            {life.headingLead}
            <br />
            <span className="accent">{life.headingAccent}</span>
          </h2>
          <p className="fin-lead">{life.lead}</p>
        </div>

        <ul className="cr-life-grid reveal">
          {life.tiles.map((t, i) => (
            <li key={t.title} className={`cr-life-tile cr-life-tile--${i + 1}`}>
              {t.src ? (
                t.kind === "video" ? (
                  <video
                    className="cr-life-media"
                    src={t.src}
                    poster={t.poster || undefined}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                    aria-hidden="true"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- client photos of unknown size
                  <img className="cr-life-media" src={t.src} alt={t.title} loading="lazy" />
                )
              ) : (
                <div className="cr-life-ph" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    {t.kind === "video" ? (
                      <>
                        <rect x="3" y="5" width="13" height="14" rx="2" />
                        <path d="m16 10 5-3v10l-5-3" />
                      </>
                    ) : (
                      <>
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <circle cx="9" cy="10" r="2" />
                        <path d="m21 16-5-5-9 9" />
                      </>
                    )}
                  </svg>
                  <span>{t.kind === "video" ? life.placeholderVideo : life.placeholder}</span>
                </div>
              )}
              <div className="cr-life-cap">
                <h3>{t.title}</h3>
                <p>{t.caption}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
