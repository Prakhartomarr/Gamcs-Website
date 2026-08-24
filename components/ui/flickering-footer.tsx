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

			const setFont = (px: number, track: number) => {
				mctx.font = `800 ${px}px Montserrat, system-ui, sans-serif`;
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
const groups = [
	{ label: 'Explore', links: footer.links.map((l) => ({ title: l.label, href: l.href })) },
	{ label: 'Solutions', links: footer.solutions.map((l) => ({ title: l.label, href: l.href })) },
	{
		label: 'Legal',
		links: [
			...footer.legal.map((l) => ({ title: l.label, href: l.href, external: 'external' in l })),
			{ title: 'LinkedIn', href: site.linkedin, external: true },
		],
	},
];

export function FlickeringFooter() {
	return (
		<footer className="relative w-full overflow-hidden border-t border-line bg-white">
			<div className="mx-auto w-full max-w-6xl px-6 pt-14 pb-10 lg:pt-16">
				<div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr] lg:gap-16">
					<div>
						<Link href="/" className="flex w-fit items-center gap-2.5" aria-label={`${site.name} home`}>
							<Image
								src={site.logo}
								alt={`${site.name} — the GA monogram in blue`}
								width={534}
								height={339}
								sizes="44px"
								className="h-7 w-auto object-contain"
							/>
							<span className="text-[15px] font-bold tracking-tight text-charcoal">{site.short}</span>
						</Link>
						<p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{intro}</p>
						<a
							href={`mailto:${site.email}`}
							className="mt-6 inline-flex min-h-[40px] items-center text-sm font-semibold text-charcoal transition-colors hover:text-blue"
						>
							{site.email}
						</a>
					</div>

					<div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
						{groups.map((g) => (
							<div key={g.label}>
								<h2 className="text-sm font-semibold text-charcoal">{g.label}</h2>
								<ul className="mt-4 space-y-2.5">
									{g.links.map((l) => {
										const cls =
											'inline-flex min-h-[32px] items-center text-left text-sm text-muted-foreground transition-colors hover:text-foreground';
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
									{g.label === 'Legal' && (
										<li>
											<CookiePreferencesLink className="inline-flex min-h-[32px] items-center text-left text-sm text-muted-foreground transition-colors hover:text-foreground" />
										</li>
									)}
								</ul>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* flickering wordmark band */}
			<div className="relative h-[120px] w-full sm:h-[150px] lg:h-[190px]">
				<FlickeringText text={site.short} />
			</div>

			<div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 pb-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
				<span>{site.copyright}</span>
				<span>{site.legalName}</span>
			</div>
		</footer>
	);
}

/** Registry-style default export name, so `import { Component }` also works. */
export const Component = FlickeringFooter;
export default FlickeringFooter;
