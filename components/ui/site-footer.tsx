import Link from 'next/link';
import CookiePreferencesLink from '@/components/CookiePreferencesLink';
import { footer, site } from '@/lib/content/gamcs';

/* ------------------------------------------------------------------ *
 * Site footer
 *
 * Link groups come from lib/content/gamcs.ts. The reference design also
 * carried AICPA SOC 2 / HIPAA / GDPR badges; those are certification
 * claims GAMCS has not stated, so that row is intentionally absent.
 *
 * This replaced a canvas that rendered "GAMCS" as a grid of flickering
 * cells. The oversized wordmark below now does that job in type, which
 * is sharper at every size, costs no JS and no animation frames, and is
 * selectable — so the canvas and its ~190 lines went with it.
 * ------------------------------------------------------------------ */
const groups = [
	{ label: 'Explore', links: footer.links.map((l) => ({ title: l.label, href: l.href })) },
	{ label: 'Solutions', links: footer.solutions.map((l) => ({ title: l.label, href: l.href })) },
	{
		label: 'Legal',
		links: footer.legal.map((l) => ({ title: l.label, href: l.href, external: 'external' in l })),
	},
];

/* LinkedIn is the only social account GAMCS has; the rest of the row is
   the address people actually reach them on. */
const social = [
	{
		href: site.linkedin,
		label: `${site.short} on LinkedIn`,
		external: true,
		icon: (
			<>
				<path d="M4.5 9.5v9" />
				<circle cx="4.5" cy="5" r="1.6" />
				<path d="M10 18.5v-5a3 3 0 0 1 6 0v5" />
				<path d="M10 9.5v9" />
			</>
		),
	},
	{
		href: `mailto:${site.email}`,
		label: `Email ${site.short}`,
		external: false,
		icon: (
			<>
				<rect x="3" y="5.5" width="18" height="13" rx="2" />
				<path d="M3.6 6.8 12 13l8.4-6.2" />
			</>
		),
	},
];

export function SiteFooter() {
	return (
		<footer className="relative w-full overflow-hidden border-t border-line bg-white">
			<div className="mx-auto w-full max-w-6xl px-6 pt-14 lg:pt-[72px]">
				<div className="grid gap-10 lg:grid-cols-[1.05fr_1.55fr] lg:gap-[72px]">
					<div>
						<Link
							href="/"
							className="flex min-h-[44px] w-fit items-center gap-[11px]"
							aria-label={`${site.name} home`}
						>
							{/* The sprite is already mounted by GaLogoSprite in the root
							    layout, so this costs no request and no image optimization —
							    the PNG was being fetched at w=3840 for a 34px slot. */}
							<svg
								className="block h-[34px] w-auto shrink-0 aspect-[183/116.5]"
								aria-hidden="true"
								focusable="false"
							>
								<use href="#ga-mark" />
							</svg>
							<span className="font-heading text-[21px] font-bold tracking-[-0.03em] text-[var(--ink-deep)]">
								{site.short}
							</span>
						</Link>

						<p className="mt-5 max-w-[330px] font-heading text-[17px] font-medium leading-[26px] tracking-[-0.02em] text-[var(--ink-deep)]">
							{site.tagline}.
						</p>

						<ul className="mt-[26px] flex items-center gap-2.5">
							{social.map((s) => (
								<li key={s.label}>
									<a
										href={s.href}
										aria-label={s.label}
										{...(s.external ? { target: '_blank', rel: 'noopener' } : {})}
										className="inline-flex h-11 w-11 items-center justify-center rounded-[13px] bg-blue text-white transition-colors hover:bg-blue-dark"
									>
										<svg
											viewBox="0 0 24 24"
											width="19"
											height="19"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.8"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											{s.icon}
										</svg>
									</a>
								</li>
							))}
						</ul>
					</div>

					<div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
						{groups.map((g) => (
							<div key={g.label}>
								<h2 className="font-heading text-[13px] font-bold uppercase leading-[18px] tracking-[0.09em] text-[var(--ink-deep)]">
									{g.label}
								</h2>
								<ul className="mt-4">
									{g.links.map((l) => {
										const cls =
											'inline-flex min-h-[44px] items-center text-left text-sm text-muted-foreground transition-colors hover:text-blue';
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
											<CookiePreferencesLink className="inline-flex min-h-[44px] items-center text-left text-sm text-muted-foreground transition-colors hover:text-blue" />
										</li>
									)}
								</ul>
							</div>
						))}
					</div>
				</div>

				<div className="mt-14 flex flex-col gap-1 border-t border-[#E7EBEE] pt-5 pb-0 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
					<span>{site.copyright}</span>
					<span>{site.legalName}</span>
				</div>
			</div>

			{/* Oversized wordmark, cropped by the footer's own edge.
			    24.9vw is not a guess: "GAMCS" in Sora 800 at -0.055em tracking
			    measures 3.788x its font size, so 24.9vw leaves ~40px of margin
			    each side at any width. The height and offset are in em so the
			    crop stays proportional as that font size tracks the viewport. */}
			<div className="mt-[26px] h-[0.63em] w-full overflow-hidden text-[24.9vw] leading-none">
				<span
					aria-hidden="true"
					className="-mt-[0.061em] block select-none text-center font-heading text-[1em] font-extrabold leading-none tracking-[-0.055em] text-blue"
				>
					{site.short}
				</span>
			</div>
		</footer>
	);
}

export default SiteFooter;
