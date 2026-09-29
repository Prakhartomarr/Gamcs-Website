'use client';

import Image from 'next/image';
import Link from 'next/link';
import CookiePreferencesLink from '@/components/CookiePreferencesLink';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { footer, intro, site } from '@/lib/content/gamcs';

/* ------------------------------------------------------------------ *
 * FlickeringText
 *
 * Draws a dot matrix across a band and raises the opacity of the cells
 * that fall inside a word, so the word reads as denser dots. Cells then
 * flicker independently.
 *
 * Performance choices, all deliberate:
 *  - the glyph mask is sampled ONCE per resize, never per frame
 *  - the backing store is 1x (a dot pattern gains nothing from retina)
 *  - the loop is throttled to ~14fps: flicker reads better slightly choppy
 *    and it costs a quarter of a 60fps redraw
 *  - it only runs while the band is on screen, and not at all under
 *    prefers-reduced-motion, which paints a single static frame instead
 * ------------------------------------------------------------------ */
function FlickeringText({
	text,
	className,
	cell = 7,
	fps = 14,
}: {
	text: string;
	className?: string;
	cell?: number;
	fps?: number;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx) return;

		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let cells: { x: number; y: number; on: boolean; a: number }[] = [];
		let w = 0;
		let h = 0;
		let raf = 0;
		let last = 0;
		let running = false;

		/** Sample which grid cells sit inside the glyphs. Runs on resize only. */
		const build = () => {
			const rect = canvas.getBoundingClientRect();
			w = Math.max(1, Math.floor(rect.width));
			h = Math.max(1, Math.floor(rect.height));
			canvas.width = w;
			canvas.height = h;

			const mask = document.createElement('canvas');
			mask.width = w;
			mask.height = h;
			const mctx = mask.getContext('2d');
			if (!mctx) return;

			/*
			 * Fit and place the word using INK metrics, not advance width.
			 *
			 * Two bugs came from using the advance box:
			 *  - `letterSpacing` appends a trailing gap after the last glyph, and
			 *    `textAlign:'center'` centres that gap too, pushing the visible
			 *    letters left by half the tracking (measured: -64px on desktop).
			 *  - `textBaseline:'middle'` centres the em box; all-caps has no
			 *    descenders, so the ink rode ~10px high.
			 * actualBoundingBox* describes the ink itself, so centring on it is
			 * exact on both axes and immune to the tracking.
			 */
			mctx.textAlign = 'left';
			mctx.textBaseline = 'alphabetic';
			const TARGET = w * 0.9;
			const MAX_SIZE = Math.floor(h * 0.82);

			// canvas cannot read a CSS variable: take the resolved --font-sans stack
			const family = getComputedStyle(document.body).fontFamily;
			const setFont = (px: number, track: number) => {
				mctx.font = `700 ${px}px ${family}`;
				try {
					(mctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${track}px`;
				} catch {
					/* letterSpacing is unsupported in some engines; tracking is cosmetic */
				}
			};
			const ink = (px: number, track: number) => {
				setFont(px, track);
				const m = mctx.measureText(text);
				return m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
			};

			let size = MAX_SIZE;
			let spacing = 0;
			if (ink(size, 0) > TARGET) {
				while (size > 12 && ink(size - 2, 0) > TARGET) size -= 2;      // long phrase: shrink
			} else {
				const step = Math.max(1, Math.round(size * 0.02));
				while (spacing < size * 1.6 && ink(size, spacing + step) <= TARGET) spacing += step;
			}

			setFont(size, spacing);
			const m = mctx.measureText(text);
			const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
			const inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
			const drawX = (w - inkW) / 2 + m.actualBoundingBoxLeft;
			const drawY = (h - inkH) / 2 + m.actualBoundingBoxAscent;

			mctx.fillStyle = '#000';
			mctx.fillText(text, drawX, drawY);

			const data = mctx.getImageData(0, 0, w, h).data;

			cells = [];
			for (let y = Math.floor(cell / 2); y < h; y += cell) {
				for (let x = Math.floor(cell / 2); x < w; x += cell) {
					const alpha = data[(y * w + x) * 4 + 3];
					const on = alpha > 90;
					cells.push({ x, y, on, a: on ? 0.55 : 0.1 });
				}
			}
		};

		const paint = () => {
			ctx.clearRect(0, 0, w, h);
			for (const c of cells) {
				ctx.fillStyle = c.on ? `rgba(70,70,70,${c.a})` : `rgba(152,160,166,${c.a})`;
				ctx.fillRect(c.x - 1, c.y - 1, 2.6, 2.6);
			}
		};

		const flicker = () => {
			for (const c of cells) {
				// only a slice of the grid changes per tick, which is what makes it
				// read as flicker rather than as a pulsing whole
				if (Math.random() < (c.on ? 0.18 : 0.06)) {
					c.a = c.on ? 0.25 + Math.random() * 0.7 : 0.05 + Math.random() * 0.11;
				}
			}
		};

		const frame = (t: number) => {
			raf = requestAnimationFrame(frame);
			if (t - last < 1000 / fps) return;
			last = t;
			flicker();
			paint();
		};

		const start = () => {
			if (running || reduce) return;
			running = true;
			raf = requestAnimationFrame(frame);
		};
		const stop = () => {
			running = false;
			if (raf) cancelAnimationFrame(raf);
			raf = 0;
		};

		const init = () => {
			build();
			paint();
		};

		// wait for the webfont so the mask matches the rendered typeface
		if (document.fonts?.ready) document.fonts.ready.then(init).catch(init);
		else init();

		const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
			threshold: 0,
		});
		io.observe(canvas);

		let rt = 0;
		const onResize = () => {
			clearTimeout(rt);
			rt = window.setTimeout(init, 150);
		};
		window.addEventListener('resize', onResize);

		return () => {
			stop();
			io.disconnect();
			clearTimeout(rt);
			window.removeEventListener('resize', onResize);
		};
	}, [text, cell, fps]);

	return <canvas ref={canvasRef} className={cn('block h-full w-full', className)} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ *
 * Footer
 *
 * Link groups come from lib/content/gamcs.ts. The reference design also
 * carried AICPA SOC 2 / HIPAA / GDPR badges; those are certification
 * claims GAMCS has not stated, so that row is intentionally absent.
 * ------------------------------------------------------------------ */
const legalGroup = {
	label: footer.headings.legal,
	links: footer.legal.map((l) => ({ title: l.label, href: l.href, external: 'external' in l })),
};
const groups = [
	{ label: footer.headings.explore, links: footer.links.map((l) => ({ title: l.label, href: l.href })) },
	{ label: footer.headings.solutions, links: footer.solutions.map((l) => ({ title: l.label, href: l.href })) },
	legalGroup,
];

/* The address is optional in the content module, so the block renders only
   when there is one. */
const postal = site.address
	? [site.address.locality, site.address.region, site.address.postalCode].filter(Boolean).join(', ')
	: '';

const LinkedInMark = () => (
	/* The wordmark, not the four-shape approximation this used to be. That one
	   gave the "n" a full-height left stem, so it read as "ih" — invisible at
	   17px on desktop, obvious in the rebuilt phone footer where the tile is
	   48px. Same two paths the team page's bio links already use. */
	<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
		<path d="M5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
		<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28z" />
	</svg>
);

const Chevron = () => (
	<svg className="gf-chev" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
		<path d="M2.5 5L7 9.5 11.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export function FlickeringFooter() {
	/*
	 * The phone footer is a different machine — a CTA block, three disclosures
	 * and an office row — so it is mounted from JS rather than hidden with CSS.
	 * `phone` starts false, which means:
	 *  - the server renders today's markup, byte for byte;
	 *  - >=640px never builds a toggle at all, so nothing there can move;
	 *  - a phone with no JS keeps the fully expanded list rather than three
	 *    collapsed panels it cannot open.
	 */
	const [phone, setPhone] = useState(false);
	const [open, setOpen] = useState<string | null>(null);

	useEffect(() => {
		// 639, not 767: this component's layout breakpoint is Tailwind `sm:`.
		const mq = window.matchMedia('(max-width:639px)');
		const sync = () => setPhone(mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	}, []);

	return (
		<footer className="gf relative w-full overflow-hidden border-t border-line bg-soft sm:bg-white">
			{/* No closing CTA here. The phone design called for one, but every page
			    already ends with the same ask immediately above the footer — the
			    contact panel on the homepage, the CTA band on the inner pages — so
			    it read as the same question twice in one scroll. */}

			{/* One grid for the whole footer: the brand block holds column 1 and the
			    link columns run to the right edge, which is what puts the bottom
			    bar's copyright under the logo and its credit under the last column. */}
			<div className="gf-topwrap container pt-14 pb-12 lg:pt-16">
				<div className="gf-top grid gap-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] lg:gap-10">
					<div className="gf-office">
						{/* One word, not a mark plus a label: the artwork IS the "GA",
						    so the text beside it is "MCS" and carries the mark's own
						    #145D90. The glyph fills its PNG edge to edge, so the type is
						    sized by cap height to the 32px mark rather than by font-size,
						    and the gap is closed to nothing. `logoWord` is the visible
						    half; the link's accessible name is still the full brand. */}
						<Link href="/" className="ga-lockup" aria-label={footer.logoLabel}>
							<Image
								src={site.logo}
								alt=""
								width={534}
								height={339}
								sizes="52px"
								className="ga-lockup-mark"
							/>
							<span className="ga-lockup-word" aria-hidden="true">{site.logoWord}</span>
						</Link>
						<p className="gf-intro mt-6 max-w-[36ch] text-[13px] leading-[1.65] text-muted-foreground">{intro}</p>
						{site.address && (
							<address className="gf-addr mt-6 text-[13px] not-italic leading-[1.7] text-muted-foreground">
								{site.address.street}
								<br />
								{postal}
							</address>
						)}
						<div className="gf-reach mt-6 flex flex-col items-start gap-2">
							<Link
								href="/contact"
								className="gf-contact inline-flex min-h-[44px] items-center text-sm font-semibold text-blue transition-colors hover:text-blue-dark lg:min-h-0 lg:py-1"
							>
								{footer.contactLabel}
							</Link>
							<a
								href={`mailto:${site.email}`}
								className="gf-mail inline-flex min-h-[44px] items-center text-sm font-semibold text-blue transition-colors hover:text-blue-dark lg:min-h-0 lg:py-1"
							>
								{site.email}
							</a>
						</div>
						<a
							href={site.linkedin}
							target="_blank"
							rel="noopener"
							aria-label={footer.linkedinLabel}
							className="gf-li mt-6 inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-blue text-white transition-colors hover:bg-blue-dark"
						>
							<LinkedInMark />
						</a>
					</div>

					{groups.map((g) => {
						const panelId = `gf-panel-${g.label.replace(/\W+/g, '').toLowerCase()}`;
						const isOpen = open === g.label;
						const cls = phone
							? 'gf-link'
							: 'inline-flex min-h-[44px] items-center text-left text-[15px] text-foreground transition-colors hover:text-blue lg:min-h-0 lg:py-0.5';
						const list = (
							<ul className={phone ? 'gf-list' : 'mt-7 space-y-3'}>
								{g.links.map((l) => (
									<li key={l.title}>
										{'external' in l && l.external ? (
											<a href={l.href} target="_blank" rel="noopener" className={cls}>
												{l.title}
											</a>
										) : (
											<Link href={l.href} className={cls}>
												{l.title}
											</Link>
										)}
									</li>
								))}
								{/* Revocable consent lives with the other legal links. A button, not
								    a link: it changes state rather than navigating. On a phone it
								    moves to the bottom bar, so it renders there instead — one
								    instance either way, never two. */}
								{g === legalGroup && !phone && (
									<li>
										<CookiePreferencesLink className={cls} />
									</li>
								)}
							</ul>
						);
						return (
							<div key={g.label} className="gf-group" data-open={phone && isOpen ? 'true' : undefined}>
								{/* Heading recedes, links carry the weight — the reference's order.
								    On a phone the <h2> keeps its role and wraps the control rather
								    than being replaced by it. */}
								<h2 className="text-[15px] text-muted-foreground">
									{phone ? (
										<button
											type="button"
											className="gf-toggle"
											aria-expanded={isOpen}
											aria-controls={panelId}
											onClick={() => setOpen(isOpen ? null : g.label)}
										>
											<span>{g.label}</span>
											<Chevron />
										</button>
									) : (
										g.label
									)}
								</h2>
								{phone ? (
									/* The inner div is the one that clips: .gf-panel animates its
									   single row from 0fr to 1fr, which is the content's own
									   height without measuring it. */
									<div className="gf-panel" id={panelId}>
										<div>{list}</div>
									</div>
								) : (
									list
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* flickering wordmark band */}
			<div className="relative h-[120px] w-full sm:h-[150px] lg:h-[190px]">
				<FlickeringText text={site.short} />
			</div>

			<div className="container">
				<div className="gf-bottom grid gap-2 border-t border-line py-6 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] lg:gap-10">
					<span>{site.copyright}</span>
					{/* Phone only, and mounted rather than hidden, so the grid above keeps
					    exactly two cells at every width >=640 — the duplicated
					    lg:grid-cols literal that aligns the copyright under the logo
					    still describes what is actually in the row. */}
					{phone && <CookiePreferencesLink className="gf-cookie" />}
					<span className="sm:text-right lg:col-span-3">{site.legalName}</span>
				</div>
			</div>
		</footer>
	);
}

/** Registry-style default export name, so `import { Component }` also works. */
export const Component = FlickeringFooter;
export default FlickeringFooter;
