'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { cn } from '@/lib/utils';
import { caseStudies, primaryCta, site, solutions } from '@/lib/content/gamcs';

/* ------------------------------------------------------------------ *
 * Floating pill header.
 *
 * Chrome (sticky pill that narrows and lifts on scroll, animated menu
 * icon, full-screen mobile sheet) follows the reference component. The
 * mega-menu panels and mobile drill-down are kept, so the 19 service
 * links and 10 case studies stay reachable.
 *
 * The reference's Sign In / Get Started pair is replaced by the single
 * real action; GAMCS has no login or self-serve signup.
 * ------------------------------------------------------------------ */

type Panel = 'solutions' | 'case' | 'who';
type Item = { label: string; href: string } | { label: string; panel: Panel };

/* Restored to the pre-Phase-2 set at the client's request. This deliberately
   differs from the copy doc's GLOBAL ELEMENTS nav (Home / Solutions / Case
   Studies / Team / FAQ) — the original was asked for back. FAQ stays reachable
   from the Who We Are panel, now pointing at the standalone /faq page. */
const items: Item[] = [
	{ label: 'Who We Are', panel: 'who' },
	{ label: 'How We Help', href: '/#how-we-help' },
	{ label: 'Solutions', panel: 'solutions' },
	{ label: 'Case Study', panel: 'case' },
	{ label: 'Team', href: '/team' },
];

const whoLinks = [
	{ title: 'Our Story', href: '/#who-we-are' },
	{ title: 'How We Help', href: '/#how-we-help' },
	{ title: 'Our Team', href: '/team' },
	{ title: 'What clients say', href: '/#testimonials' },
	/* the standalone page now, not the homepage section it used to hit */
	{ title: 'FAQ', href: '/faq' },
];

/* Derived from `solutions[]`, so the menu can never list a pillar that has no
   page — or miss one that does. Three columns, wrapping to two rows of three. */
const solutionColumns = solutions.map((s) => ({
	heading: s.navLabel,
	href: `/solutions/${s.slug}`,
	links: s.atAGlance.slice(0, 4),
}));

const Arrow = () => (
	<svg viewBox="0 0 16 16" className="nav-arrow" aria-hidden="true">
		<path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);
const Chevron = () => (
	<svg viewBox="0 0 16 16" className="nav-chev" aria-hidden="true">
		<path d="M4 6.5L8 10.5 12 6.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export function Header() {
	const [open, setOpen] = React.useState(false);
	const [sub, setSub] = React.useState<Panel | null>(null);
	const [panel, setPanel] = React.useState<Panel | null>(null);
	const scrolled = useScroll(10);
	const barRef = React.useRef<HTMLElement>(null);
	const sheetRef = React.useRef<HTMLDivElement>(null);
	const closeTimer = React.useRef<number>();
	const wasOpen = React.useRef(false);
	const baseId = React.useId();
	const sheetId = `${baseId}-sheet`;
	const toggle = () => barRef.current?.querySelector<HTMLButtonElement>('[data-nav-toggle]');

	// lock body scroll while the mobile sheet is up
	React.useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	/* The sheet is xl:hidden, so widening past the breakpoint hides it without
	   changing `open` — which left body scroll locked with no visible control to
	   release it, and pinned the header in its unscrolled chrome. Reset when the
	   desktop layout takes over. */
	React.useEffect(() => {
		const mq = window.matchMedia('(min-width: 1280px)');
		const sync = () => {
			if (mq.matches) closeAll();
		};
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	}, []);

	/* Move focus into the sheet on open and on each drill-down step, and hand it
	   back to the toggle on close. Without this, opening the sheet or pressing
	   'Solutions' dropped focus to <body>. */
	React.useEffect(() => {
		if (!open) return;
		sheetRef.current?.querySelector<HTMLElement>('a[href],button')?.focus();
	}, [open, sub]);

	React.useEffect(() => {
		if (open) {
			wasOpen.current = true;
			return;
		}
		if (!wasOpen.current) return;
		wasOpen.current = false;
		toggle()?.focus();
	}, [open]);

	React.useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeAll();
		};
		const onClick = (e: MouseEvent) => {
			if (!barRef.current?.contains(e.target as Node)) setPanel(null);
		};
		document.addEventListener('keydown', onKey);
		document.addEventListener('click', onClick);
		return () => {
			document.removeEventListener('keydown', onKey);
			document.removeEventListener('click', onClick);
			window.clearTimeout(closeTimer.current);
		};
	}, []);

	const hoverOpen = (k: Panel) => {
		window.clearTimeout(closeTimer.current);
		setPanel(k);
	};
	const hoverClose = () => {
		closeTimer.current = window.setTimeout(() => setPanel(null), 120);
	};
	function closeAll() {
		setPanel(null);
		setOpen(false);
		setSub(null);
	}

	/* Panel bodies render next to their own trigger (below). As siblings after
	   </nav> only the last-focused trigger's panel stayed open, so the 19
	   Solutions links and 4 Who We Are links were unreachable by keyboard. */
	const renderPanel = (key: Panel) => {
		if (key === 'solutions')
			return (
						<div className="mega-inner mega-3">
							{solutionColumns.map((col) => (
								<div className="mega-col" key={col.heading}>
									<Link className="mega-head" href={col.href} onClick={closeAll}>
										{col.heading} <Arrow />
									</Link>
									<ul>
										{col.links.map((l) => (
											<li key={l}>
												<Link href={col.href} onClick={closeAll}>{l}</Link>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
			);
		if (key === 'case')
			return (
						<div className="mega-inner mega-2">
							<div className="mega-col">
								<Link className="mega-head" href="/case-study" onClick={closeAll}>
									All case studies <Arrow />
								</Link>
								<ul>
									{caseStudies.items.slice(0, 5).map((c) => (
										<li key={c.no}>
											<Link href="/case-study" onClick={closeAll}>{c.title}</Link>
										</li>
									))}
								</ul>
							</div>
							<div className="mega-col">
								<span className="mega-head as-label">More</span>
								<ul>
									{caseStudies.items.slice(5).map((c) => (
										<li key={c.no}>
											<Link href="/case-study" onClick={closeAll}>{c.title}</Link>
										</li>
									))}
								</ul>
							</div>
						</div>
			);
		return (
						<div className="mega-inner mega-1">
							<div className="mega-col">
								<span className="mega-head as-label">Who We Are</span>
								<ul>
									{whoLinks.map((l) => (
										<li key={l.title}>
											<Link href={l.href} onClick={closeAll}>{l.title}</Link>
										</li>
									))}
								</ul>
							</div>
						</div>
		);
	};

	/* The sheet covers the page but the page stays focusable, so Tab used to walk
	   behind the overlay. Cycle within the toggle + sheet while it is open. */
	const trapTab = (e: React.KeyboardEvent) => {
		if (e.key !== 'Tab' || !open) return;
		const t = toggle();
		const inSheet = sheetRef.current
			? Array.from(sheetRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'))
			: [];
		const f = t ? [t, ...inSheet] : inSheet;
		if (!f.length) return;
		const first = f[0];
		const last = f[f.length - 1];
		if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		} else if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		}
	};

	return (
		<header
			ref={barRef}
			onMouseLeave={hoverClose}
			onKeyDown={trapTab}
			/* A solid full-width white bar, not a floating pill: the reference
			   header spans the page and sits flush above the hero. `scrolled`
			   now only earns a hairline and a shadow, so there is still a
			   separation once the #EFEFEF hero has moved up behind it. */
			className={cn(
				'sticky top-0 z-50 w-full bg-white transition-shadow duration-300',
				{
					'border-b border-border shadow-sm': scrolled || open,
					'border-b border-transparent': !scrolled && !open,
				},
			)}
		>
			<nav
				className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-5 py-4 sm:px-8 sm:py-5 lg:px-12" 
				aria-label="Primary"
			>
				{/* GA mark + the words set in type. The link carries the accessible
				    name, so the mark itself is decorative. */}
				<Link href="/" aria-label={`${site.name} home`} className="brand-lockup shrink-0">
					<span className="brand-mark-wrap">
						<Image
							src={site.logo}
							alt=""
							width={534}
							height={339}
							sizes="(max-width: 767px) 42px, 48px"
							priority
							className="brand-mark"
						/>
						{/* Decorative: the real mark's alpha, masked and filled with the
						    brand blue, wiped across on hover. Using the actual asset
						    rather than a redrawn SVG keeps the logo exact. */}
						<span className="brand-mark-wipe" aria-hidden="true" />
					</span>
					<span className="brand-words">
						<span className="brand-w1">MANAGEMENT</span>
						<span className="brand-w2">CONSULTANTS</span>
					</span>
				</Link>

				{/* full nav only where it comfortably fits the pill */}
				<div className="nav hidden xl:flex">
					{items.map((item) =>
						'href' in item ? (
							<Link key={item.label} href={item.href} onClick={closeAll}>
								{item.label}
							</Link>
						) : (
							<React.Fragment key={item.label}>
								<button
									type="button"
									className={panel === item.panel ? 'nav-trigger is-open' : 'nav-trigger'}
									aria-expanded={panel === item.panel}
									aria-controls={`${baseId}-${item.panel}`}
									onMouseEnter={() => hoverOpen(item.panel)}
									onFocus={() => hoverOpen(item.panel)}
									onClick={() => setPanel(panel === item.panel ? null : item.panel)}
								>
									{item.label}
									<Chevron />
								</button>
								<div
									id={`${baseId}-${item.panel}`}
									className={cn('mega', panel === item.panel && 'is-open')}
									onMouseEnter={() => hoverOpen(item.panel)}
									hidden={panel !== item.panel}
								>
									{renderPanel(item.panel)}
								</div>
							</React.Fragment>
						),
					)}
				</div>

				<div className="hidden shrink-0 xl:block">
					<Link href={primaryCta.href} data-cta="header" className={buttonVariants({ size: 'lg' })}>
						{primaryCta.label}
					</Link>
				</div>

				<Button
					size="icon"
					variant="outline"
					data-nav-toggle=""
					onClick={() => {
						setOpen(!open);
						setSub(null);
					}}
					/* size-8 gave a 36px target; the touch tier is built to 44px */
					className="size-11 xl:hidden"
					aria-label={open ? 'Close navigation' : 'Open navigation'}
					aria-controls={sheetId}
					aria-expanded={open}
				>
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>

			{/* ---------- mobile sheet with drill-down ---------- */}
			<div
				ref={sheetRef}
				id={sheetId}
				role="dialog"
				aria-modal="true"
				aria-label="Navigation"
				className={cn(
					'fixed inset-x-0 bottom-0 top-14 z-50 flex flex-col overflow-y-auto border-y bg-white xl:hidden',
					open ? 'block' : 'hidden',
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className="flex h-full w-full flex-col gap-y-2 p-4 ease-out data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 data-[slot=open]:animate-in data-[slot=open]:zoom-in-95"
				>
					{!sub && (
						<>
							<ul className="drawer-list">
								{items.map((item) => (
									<li key={item.label}>
										{'href' in item ? (
											<Link href={item.href} onClick={closeAll}>{item.label}</Link>
										) : (
											<button type="button" onClick={() => setSub(item.panel)}>
												{item.label}
												<Arrow />
											</button>
										)}
									</li>
								))}
							</ul>
							<Link href={primaryCta.href} onClick={closeAll} data-cta="mobile-drawer" className={cn(buttonVariants({ size: 'lg' }), 'mt-auto w-full')}>
								{primaryCta.label}
							</Link>
						</>
					)}

					{sub && (
						<div className="drawer-sub">
							<button type="button" className="drawer-back" onClick={() => setSub(null)}>
								<span aria-hidden="true">‹</span> Go back
							</button>

							{sub === 'solutions' &&
								solutionColumns.map((col) => (
									<div className="drawer-group" key={col.heading}>
										<Link className="drawer-group-head" href={col.href} onClick={closeAll}>{col.heading}</Link>
										<ul>
											{col.links.map((l) => (
												<li key={l}><Link href={col.href} onClick={closeAll}>{l}</Link></li>
											))}
										</ul>
									</div>
								))}

							{sub === 'case' && (
								<div className="drawer-group">
									<Link className="drawer-group-head" href="/case-study" onClick={closeAll}>All case studies</Link>
									<ul>
										{caseStudies.items.map((c) => (
											<li key={c.no}><Link href="/case-study" onClick={closeAll}>{c.title}</Link></li>
										))}
									</ul>
								</div>
							)}

							{sub === 'who' && (
								<div className="drawer-group">
									<ul>
										{whoLinks.map((l) => (
											<li key={l.title}><Link href={l.href} onClick={closeAll}>{l.title}</Link></li>
										))}
									</ul>
								</div>
							)}

						</div>
					)}
				</div>
			</div>
		</header>
	);
}
