import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePageLayout from "@/components/ServicePageLayout";
import { solutions } from "@/lib/content/gamcs";
import { pageMetadata } from "@/lib/seo";

/** Every pillar is prerendered; an unknown slug 404s rather than rendering empty. */
export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const s = solutions.find((x) => x.slug === params.slug);
  if (!s) return {};
  return pageMetadata({
    /* The doc's title tag already carries "| GAMCS", so it is set absolute to
       stop the layout template appending the brand a second time. */
    title: s.title,
    description: s.metaDescription,
    path: `/solutions/${s.slug}`,
  });
}

export default function SolutionPage({ params }: { params: { slug: string } }) {
  const solution = solutions.find((s) => s.slug === params.slug);
  if (!solution) notFound();
  return <ServicePageLayout solution={solution} />;
}
