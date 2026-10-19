'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GaLogo from '@/components/ui/GaLogo';
import { Button } from '@/components/ui/button';
import CTA from '@/components/CTA';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { cn } from '@/lib/utils';
import { primaryCta } from '@/lib/content/gamcs';
import { header } from '@/lib/content/ui';

/* ------------------------------------------------------------------ *
 * Floating pill header.
 *
 * Chrome (sticky pill that narrows and lifts on scroll, animated menu
 * icon, full-screen mobile sheet) follows the reference component.
 *
 * Every item is a plain link. The three mega-menus and the phone
 * drill-down they fed were removed at the client's request
 * (2026-10-19); the phone sheet now shows the same flat list as the
 * bar, and what the panels used to reach lives in the footer.
 *
 * The reference's Sign In / Get Started pair is replaced by the single
 * real action; GAMCS has no login or self-serve signup.
 * ------------------------------------------------------------------ */

const { items } = header;

export function Header() {
	const pathname = usePathname();
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);
	const barRef = React.useRef<HTMLElement>(null);
	const sheetRef = React.useRef<HTMLDivElement>(null);
	const wasOpen = React.useRef(false);
	const sheetId = `${React.useId()}-sheet`;
	const toggle = () => barRef.current?.querySelector<HTMLButtonElement>('[data-nav-toggle]');
	const close = () => setOpen(false);

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
			if (mq.matches) setOpen(false);
		};
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	}, []);

	/* Move focus into the sheet on open and hand it back to the toggle on close.
	   Without this, opening the sheet dropped focus to <body>. */
	React.useEffect(() => {
		if (!open) return;
		/* Two frames late, deliberately. The sheet only becomes `visible` in the
		   commit that sets `open`, and .focus() on an element the browser still
		   computes as visibility:hidden silently does nothing — measured: one rAF
		   fired no focusin at all and focus stayed on the toggle, while the same
		   .focus() called by hand a moment later worked. The second frame is the
		   one that runs after the style recalc. */
		let inner = 0;
		const outer = requestAnimationFrame(() => {
			inner = requestAnimationFrame(() => {
				sheetRef.current?.querySelector<HTMLElement>('a[href],button:not([disabled])')?.focus();
			});
		});
		return () => {
			cancelAnimationFrame(outer);
			cancelAnimationFrame(inner);
		};
	}, [open]);

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
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, []);

	/* The sheet covers the page but the page stays focusable, so Tab used to walk
	   behind the overlay. Cycle within the toggle + sheet while it is open.
	   Bound on BOTH <header> and the sheet, because the sheet is rendered as a
	   sibling of <header> (see the note there) in the React tree as well as the
	   DOM — so a keydown from inside it never bubbles to a handler on <header>.
	   With one binding only the Shift+Tab half worked, `first` being the toggle;
	   the forward wrap tested `activeElement === last`, always a control in the
	   sheet, so it was dead code and Tab walked out of the open menu. */
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
		<>
		<header
			ref={barRef}
			onKeyDown={trapTab}
			/* A floating pill inset from the page edges, translucent white over
			   whatever is behind it. The <header> itself stays transparent and
			   sticky so it keeps its place in the flow — only the hero pulls up
			   underneath it, which is what lets the shader run to the top of the
			   page without every other page needing its own top clearance.
			   `scrolled` firms the pill up rather than adding a border, since
			   over white sections there is nothing for a hairline to separate.
			   z-[70], not 50: the mobile sheet lives inside this stacking context,
			   and at 50 the sticky CTA (55) and cookie banner (65) painted over it. */
			className={cn('site-head sticky top-0 z-[70] w-full', {
				'is-stuck': scrolled || open,
			})}
		>
			<nav className="site-bar" aria-label="Primary">
				{/* Mark always visible; the words reveal on hover/focus.
				    Inert while the sheet is up: the bar paints above the sheet so the
				    toggle stays tappable, which leaves the logo exposed too — but the
				    focus cycle is [toggle, ...sheet] and aria-modal hides it from AT,
				    so it was pointer-only. Measured: clicking it navigated and left
				    the sheet open, aria-expanded true, over the page it landed on. */}
				<GaLogo className={cn('shrink-0', open && 'pointer-events-none')} />

				{/* full nav only where it comfortably fits the pill */}
				<div className="nav hidden xl:flex">
					{items.map((item) => (
						<Link key={item.label} href={item.href} onClick={close} aria-current={pathname === item.href ? 'page' : undefined}>
							{item.label}
						</Link>
					))}
				</div>

				<div className="hidden shrink-0 xl:block">
					<CTA href={primaryCta.href} data-cta="header">
						{primaryCta.label}
					</CTA>
				</div>

				<Button
					size="icon"
					variant="outline"
					data-nav-toggle=""
					onClick={() => setOpen(!open)}
					/* size-8 gave a 36px target; the touch tier is built to 44px */
					className="size-11 xl:hidden"
					aria-label={open ? header.closeNav : header.openNav}
					aria-controls={sheetId}
					aria-expanded={open}
				>
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>
		</header>

			{/* ---------- mobile sheet ----------
			    OUTSIDE <header>, and that is the whole reason it works. The bar
			    carries `is-stuck` whenever `scrolled || open`, and .site-head.is-stuck
			    sets backdrop-filter (globals.css). A backdrop-filter makes its element
			    a containing block for position:fixed descendants — so the moment this
			    sheet opened, its own `top:var(--header-h); bottom:0` started resolving
			    against a 76px-tall header instead of the viewport and it computed to
			    zero height. The icon still animated, so the button looked alive while
			    nothing appeared. Rendered as a sibling it is fixed to the viewport.

			    z-[68], not 50: out here it has to clear the cookie banner (65) and the
			    sticky CTA (55), while staying under the bar itself (70) so the close
			    button stays visible and tappable above it. */}
			<div
				ref={sheetRef}
				id={sheetId}
				onKeyDown={trapTab}
				role="dialog"
				aria-modal="true"
				aria-label="Navigation"
				onClick={(e) => {
					/* the sheet is its own backdrop: a tap on the panel itself, rather
					   than on a link inside it, closes */
					if (e.target === e.currentTarget) close();
				}}
				className={cn(
					'fixed inset-x-0 bottom-0 top-[var(--header-h)] z-[68] flex flex-col overflow-y-auto border-y bg-white xl:hidden',
					/* visibility is transitioned with opacity so it holds the sheet on
					   screen for the fade OUT too, then takes it out of the a11y tree */
					'transition-[opacity,visibility] duration-200 ease-out',
					open ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none',
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className="flex h-full w-full flex-col gap-y-2 p-4 ease-out data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 data-[slot=open]:animate-in data-[slot=open]:zoom-in-95"
				>
					<ul className="drawer-list">
						{items.map((item) => (
							<li key={item.label}>
								<Link href={item.href} onClick={close} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>
							</li>
						))}
					</ul>
					<CTA href={primaryCta.href} onClick={close} data-cta="mobile-drawer" className="mt-auto w-full">
						{primaryCta.label}
					</CTA>

					{/* aria-modal keeps a screen reader inside this sheet, and the toggle
					    that closes it sits outside, so the sheet carries its own close.
					    Hidden until it has keyboard focus. */}
					<button
						type="button"
						onClick={close}
						className="sr-only focus-visible:not-sr-only focus-visible:self-start focus-visible:rounded-full focus-visible:border focus-visible:px-4 focus-visible:py-2"
					>
						{header.closeNav}
					</button>
				</div>
			</div>
		</>
	);
}
