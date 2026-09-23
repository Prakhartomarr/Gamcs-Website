'use client';

import Image from 'next/image';
import Link from 'next/link';
import CookiePreferencesLink from '@/components/CookiePreferencesLink';
import { useEffect, useRef } from 'react';
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
	<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
		<circle cx="6.1" cy="5.8" r="1.9" />
		<rect x="4.4" y="9.3" width="3.4" height="10.3" rx="0.5" />
		<rect x="10.1" y="9.3" width="3.3" height="10.3" rx="0.5" />
		<path d="M13.4 14.1a3.5 3.5 0 0 1 6.3 2.1v3.4h-3.4v-3.1a1.5 1.5 0 0 0-2.9-.5z" />
	</svg>
);

export function FlickeringFooter() {
	return (
		<footer className="relative w-full overflow-hidden border-t border-line bg-white">
			{/* One grid for the whole footer: the brand block holds column 1 and the
			    link columns run to the right edge, which is what puts the bottom
			    bar's copyright under the logo and its credit under the last column. */}
			<div className="container pt-14 pb-12 lg:pt-16">
				<div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] lg:gap-10">
					<div>
						<Link href="/" className="flex w-fit items-center gap-2.5" aria-label={footer.logoLabel}>
							<Image
								src={site.logo}
								alt={footer.logoAlt}
								width={534}
								height={339}
								sizes="44px"
								className="h-8 w-auto object-contain"
							/>
							<span className="text-[15px] font-bold tracking-tight text-charcoal">{site.short}</span>
						</Link>
						<p className="mt-6 max-w-[36ch] text-[13px] leading-[1.65] text-muted-foreground">{intro}</p>
						{site.address && (
							<address className="mt-6 text-[13px] not-italic leading-[1.7] text-muted-foreground">
								{site.address.street}
								<br />
								{postal}
							</address>
						)}
						<div className="mt-6 flex flex-col items-start gap-2">
							<Link
								href="/contact"
								className="inline-flex min-h-[44px] items-center text-sm font-semibold text-blue transition-colors hover:text-blue-dark lg:min-h-0 lg:py-1"
							>
								{footer.contactLabel}
							</Link>
							<a
								href={`mailto:${site.email}`}
								className="inline-flex min-h-[44px] items-center text-sm font-semibold text-blue transition-colors hover:text-blue-dark lg:min-h-0 lg:py-1"
							>
								{site.email}
							</a>
						</div>
						<a
							href={site.linkedin}
							target="_blank"
							rel="noopener"
							aria-label={footer.linkedinLabel}
							className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-blue text-white transition-colors hover:bg-blue-dark"
						>
							<LinkedInMark />
						</a>
					</div>

					{groups.map((g) => (
						<div key={g.label}>
							{/* Heading recedes, links carry the weight — the reference's order. */}
							<h2 className="text-[15px] text-muted-foreground">{g.label}</h2>
							<ul className="mt-7 space-y-3">
								{g.links.map((l) => {
									const cls =
										'inline-flex min-h-[44px] items-center text-left text-[15px] text-foreground transition-colors hover:text-blue lg:min-h-0 lg:py-0.5';
									return (
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
									);
								})}
								{/* Revocable consent lives with the other legal links. A button, not
								    a link: it changes state rather than navigating. */}
								{g === legalGroup && (
									<li>
										<CookiePreferencesLink className="inline-flex min-h-[44px] items-center text-left text-[15px] text-foreground transition-colors hover:text-blue lg:min-h-0 lg:py-0.5" />
									</li>
								)}
							</ul>
						</div>
					))}
				</div>
			</div>

			{/* flickering wordmark band */}
			<div className="relative h-[120px] w-full sm:h-[150px] lg:h-[190px]">
				<FlickeringText text={site.short} />
			</div>

			<div className="container">
				<div className="grid gap-2 border-t border-line py-6 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] lg:gap-10">
					<span>{site.copyright}</span>
					<span className="sm:text-right lg:col-span-3">{site.legalName}</span>
				</div>
			</div>
		</footer>
	);
}

/** Registry-style default export name, so `import { Component }` also works. */
export const Component = FlickeringFooter;
export default FlickeringFooter;
