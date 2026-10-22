'use client';

import Image from 'next/image';
import Link from 'next/link';
import CookiePreferencesLink from '@/components/CookiePreferencesLink';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { footer, officeCards, officeSlug, site } from '@/lib/content/gamcs';
import { fill } from '@/lib/content/fill';
import { header } from '@/lib/content/ui';


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
/* Three columns (client, 2026-10-20).

   EXPLORE IS THE NAVBAR. It reads `header.items` rather than a list of its
   own, so the footer carries exactly the six destinations the header does,
   with the header's own wording — "What we do" for /solutions, "Case
   Studies" for /case-study, "Team" for /team, where the footer used to say
   Solutions, Case Study and Founders & advisors. A link added to the nav
   turns up here with no edit, and the two can no longer disagree.

   SOLUTIONS IS GONE. The five pillar pages it linked keep no site-wide link;
   see lib/content/gamcs.ts for the note and for how to put it back. */
const groups = [
	{ label: footer.headings.explore, links: header.items.map((l) => ({ title: l.label, href: l.href })) },
	{ label: footer.headings.resources, links: footer.resources.map((l) => ({ title: l.label, href: l.href })) },
	legalGroup,
];

export const LinkedInMark = () => (
	/* The brand tile the client supplied: LinkedIn blue rounded square, white
	   wordmark. Drawn rather than linked as a PNG — it is two paths and a
	   rect, it stays crisp at any size, and it needs no network request.

	   #0A66C2 is LinkedIn's own blue, not --blue (#0F5E97): a brand mark in
	   someone else's palette stops being that brand's mark. It used to be the
	   one place on the site that colour appeared; MailMark takes it too now,
	   at the client's asking, so the two tiles match. Change one and change
	   the other.

	   The glyph is the same two paths the team page's bio links use — the
	   wordmark, not the four-shape approximation this was once, which gave
	   the "n" a full-height left stem so it read as "ih". */
	<svg viewBox="0 0 36 36" width="36" height="36" fill="none" aria-hidden="true">
		<rect width="36" height="36" rx="9.7" fill="#0A66C2" />
		<g transform="translate(6 6) scale(1)" fill="#FFFFFF">
			<path d="M5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
			<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28z" />
		</g>
	</svg>
);

export const MailMark = () => (
	/* The mail tile, replacing the blue "info@gamcs.in" pill that used to sit
	   here (client, 2026-10-21). Drawn, like the LinkedIn mark beside it, so
	   the two tiles are the same 36px rounded square and stay crisp at any
	   size.

	   #0A66C2, the same blue as the LinkedIn tile beside it (client,
	   2026-10-21). It was --blue (#0F5E97) for a few minutes, on the
	   reasoning that this tile is GAMCS's own control while LinkedIn's mark
	   has to stay in LinkedIn's palette — but the two squares sit 10px
	   apart, and at that distance two near-blues read as a mistake rather
	   than as a distinction. One blue for the pair.

	   The glyph is stroked, not filled: at 20x14 the filled envelope's white
	   seams close up, and a 1.7px outline is what stays readable. */
	<svg viewBox="0 0 36 36" width="36" height="36" fill="none" aria-hidden="true">
		<rect width="36" height="36" rx="9.7" fill="#0A66C2" />
		<g
			transform="translate(8 11)"
			stroke="#FFFFFF"
			strokeWidth="1.7"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="0.85" y="0.85" width="18.3" height="12.3" rx="2.6" />
			<path d="M2 2.1 10 8.5 18 2.1" />
		</g>
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

			{/* One grid for the whole footer: the brand block left, the three
			    link columns hard right (client, 2026-10-20).

			    THE TRACKS ARE PINNED, not fractions. As minmax(0,1fr) each they
			    divided whatever the container happened to be, so the pitch the
			    client approved at 1440 was a different number at 1100 and at 1900.
			    173px tracks on a 54px gap hold that 227px pitch at every width
			    from 1280 up; the slack always lands in the brand column, which is
			    the 1fr. 48px at lg because a 920px container cannot give the brand
			    column the ~245px the lockup needs AND three 227px pitches — 221
			    there is 6px off and the band is a fixed container, so it does not
			    drift either.

			    THE LAST TRACK IS max-content, which is what right-aligns the TEXT
			    rather than the block. "Cookie Preferences" is 134px inside a 173px
			    track, so a block flush to the container would have left the words
			    39px short of "All rights reserved." in the bar below. Sized to its
			    own content, the column's right edge IS the text's right edge, and
			    it lands on the container's. No hard-coded 39: a longer label moves
			    it on its own. The first two stay fixed so the pitch is unchanged. */}
			<div className="gf-topwrap container pt-14 pb-12 lg:pt-16">
				<div className="gf-top grid gap-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_173px_173px_173px_max-content] lg:gap-x-[48px] xl:gap-x-[54px]">
					<div className="gf-office">
						{/* THE FULL NAME, not the contraction (client, 2026-10-20).
						    This was the mark plus "MCS", so the artwork's "GA" and the
						    type together read "GAMCS". It is now the mark plus
						    MANAGEMENT / CONSULTANTS stacked beside it, which reads "GA
						    Management Consultants".

						    That changes how the two are sized to each other. "MCS" was
						    locked to the mark by CAP HEIGHT — one line of type as tall
						    as the glyph. The stack is locked by BLOCK HEIGHT instead:
						    two line boxes that together come to the mark's height, so
						    the first line's cap sits on the top of the "GA" and the
						    second's baseline on its foot. The numbers are in
						    globals.css, with how they were derived.

						    The span is aria-hidden and the link keeps the full brand as
						    its accessible name, so nothing is announced twice. */}
						<Link href="/" className="ga-lockup" aria-label={footer.logoLabel}>
							<Image
								src={site.logo}
								alt=""
								width={534}
								height={339}
								sizes="72px"
								className="ga-lockup-mark"
							/>
							<span className="ga-lockup-name" aria-hidden="true">
								{site.logoLines.map((line) => (
									<span key={line}>{line}</span>
								))}
							</span>
						</Link>
						<p className="gf-intro">{footer.blurb}</p>

						{/* WHAT IS NOT HERE ANY MORE (client, 2026-10-20).
						    - The registered office. It was three lines on every page of
						      the site; it is still the PostalAddress in lib/schema.ts, the
						      address on /contact and the map cards on the homepage, so
						      nothing published it alone.
						    - The "Contact Us" accent link. /contact is in the Company
						      column beside this, so the footer was offering the same
						      destination twice, once in blue.
						    - The mailto. BACK, twice, on 2026-10-21 — as the address under
						      "Let's connect" and as the tile beside LinkedIn. The bullet
						      stays as the record of why it left: `site.email` is also on
						      /contact with the rest of the ways to reach the firm.
						   The column is the lockup, one sentence, and a headed block:
						   the address, then the LinkedIn and mail tiles. */}
						{/* A heading over the address and the two tiles. The other four
						    column heads name a category of links; this one is an invitation,
						    because what it heads is a way to reach the firm rather than a
						    list of pages (client, 2026-10-21). Same <h2> treatment as the
						    rest so the footer has one heading level across its columns.

						    The heading and the address are one block, not two children of
						    .gf-office: on a phone that grid spaces every child by its own
						    16px row gap, which would push the address off its heading. */}
						<div className="gf-connect">
							<h2 className="gf-grouph text-[15px] text-muted-foreground lg:text-[14px]">
								{footer.headings.connect}
							</h2>
							{/* The address in full, under the heading that introduces it.
							    It is a link as well as a label — an email address that
							    cannot be clicked is a string to copy by hand — and the mail
							    tile below goes to the same place. Two links, one
							    destination, different names: that is a logo-and-"Home"
							    pair, not the two-links-one-name collision (WCAG 2.4.4)
							    the old "Contact Us" accent link was removed for. */}
							<a className="gf-email" href={`mailto:${site.email}`}>
								{site.email}
							</a>
						</div>
						<div className="gf-actions">
							<a
								href={site.linkedin}
								target="_blank"
								rel="noopener"
								aria-label={footer.linkedinLabel}
								className="gf-soc"
							>
								<LinkedInMark />
							</a>
							{/* A tile, not a pill with the address in it: the address is
							    already set out above, and two controls of the same size read
							    as one row. It carries no visible text, so the aria-label is
							    the whole accessible name — "Email info@gamcs.in", which
							    says both the verb and the destination. */}
							<a
								href={`mailto:${site.email}`}
								className="gf-soc"
								aria-label={fill(footer.emailCtaLabel, { email: site.email })}
							>
								<MailMark />
							</a>
						</div>
					</div>

					{/* OFFICES (client, 2026-10-21). The three places a visitor can
					    actually walk into, in the white space the brand column left
					    beside Explore.

					    Read off `officeCards`, which is the same list the homepage
					    contact panel renders and which lib/schema.ts takes the
					    registered address from — so an office that moves moves here
					    too, and the footer cannot drift from the map cards. That
					    export is all-or-nothing by design: lose the registered
					    office and it returns empty rather than leaving two other
					    firms' addresses standing under this firm's footer, which is
					    why this renders nothing at all in that case.

					    CITY AND STATE, NOTHING ELSE (client, 2026-10-21). The street,
					    postcode and landmark are still on `officeCards`, and two
					    pages print all three in full: the homepage map deck and
					    /contact, whose office tabs replaced <Directions> later the
					    same day — <Directions> read `site.address` and so showed the
					    registered office alone. lib/schema.ts publishes that office
					    as a PostalAddress either way, so the address a search engine
					    indexes is unchanged.

					    No <address> any more either. It was wrapping three lines of
					    real postal address; one line naming a city is a place, not the
					    contact information that element is for.

					    Not links, in any case. The map links live on /contact and on
					    the homepage cards, and adding a fourth copy here would be a
					    third route to the same place. */}
					{officeCards.length > 0 && (
						<div className="gf-offices">
							<h2 className="gf-grouph text-[15px] text-muted-foreground lg:text-[14px]">
								{footer.headings.offices}
							</h2>
							{/* Each city goes to its own office on /contact (client,
							    2026-10-22): the hash scrolls to the VISIT US card and
							    the query tells its tablist which tab to open. Both
							    halves of that URL are built from `officeSlug`, which
							    /contact reads with the same function. */}
							<ul className="gf-offlist">
								{officeCards.map((o) => (
									<li className="gf-off" key={o.coords}>
										{/* THE CITY ALONE (client, 2026-10-22). This printed
										    "Gurugram, Haryana" — itself already a trim from the
										    full street address on 2026-10-21. The state was
										    doing no work here: the column's job is to say where
										    the firm is, the three cities are unambiguous, and
										    the office's full address is one click away at the
										    other end of this link. Each name is still unique, so
										    the three links are still distinguishable in a screen
										    reader's link list. */}
										<Link href={`/contact?office=${officeSlug(o)}#offices`}>
											{o.locality}
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}


					{groups.map((g) => {
						const panelId = `gf-panel-${g.label.replace(/\W+/g, '').toLowerCase()}`;
						const isOpen = open === g.label;
						const cls = phone
							? 'gf-link'
							: 'inline-flex min-h-[44px] items-center text-left text-[15px] text-foreground transition-colors hover:text-blue lg:min-h-0 lg:py-0 lg:leading-[1.2]';
						const list = (
							<ul
								className={
									phone
										? 'gf-list'
										: /* Column rhythm, from the client's reference (2026-10-20).
										     Measured there: links 25px apart, label 43px above the first
										     one. Ours ran 34 and 64.

										     `leading-[1.2]` is on the LIST as well as the links. Each
										     link is an inline-flex inside its <li>, so the li's own line
										     box is the taller of the inherited strut and the box sitting
										     on its baseline — at the body's 1.5 the strut alone was
										     22.5px and tightening only the link changed nothing. The
										     4px gap is what is left after the baseline alignment adds
										     its own 3.6 to an 18px box: 18 + 3.6 + 4 is the 25.6 pitch
										     measured on the page. Phone keeps 44px rows. */
										  'mt-7 space-y-3 lg:mt-5 lg:space-y-[4px] lg:leading-[1.2]'
								}
							>
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
								<h2 className="gf-grouph text-[15px] text-muted-foreground lg:text-[14px]">
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

			{/* The flickering wordmark band. KEPT at the client's request
			    (2026-10-20) — it was taken out in the first cut of this footer and
			    put straight back. FlickeringText draws a dot matrix across the
			    band and raises the opacity of the cells that fall inside "GAMCS",
			    then flickers them at ~14fps; it samples the glyph mask once per
			    resize, runs only while the band is on screen, and paints a single
			    static frame under prefers-reduced-motion. */}
			<div className="relative h-[120px] w-full sm:h-[150px] lg:h-[190px]">
				<FlickeringText text={site.short} />
			</div>

			<div className="container">
				{/* The notice left, the reservation hard right (client, 2026-10-20).
				    The two spans are wrapped rather than placed as separate grid
				    items: the phone block pins .gf-bottom to a single column so the
				    Cookie Preferences button can take a row of its own, and a second
				    item would have taken a third. As one item the pair is a row that
				    splits at 640 and stacks below it, where "© 2026 GA Management
				    Consultants LLP." and "All rights reserved." come to ~345px
				    against a 280px bar and would wrap mid-sentence on one line. */}
				<div className="gf-bottom grid gap-2 border-t border-line py-6 text-xs text-muted-foreground">
					<div className="gf-notice">
						<span>{site.copyright}</span>
						<span>{site.rights}</span>
					</div>
					{/* Phone only, and mounted rather than hidden. */}
					{phone && <CookiePreferencesLink className="gf-cookie" />}
				</div>
			</div>
		</footer>
	);
}

/** Registry-style default export name, so `import { Component }` also works. */
export const Component = FlickeringFooter;
export default FlickeringFooter;
