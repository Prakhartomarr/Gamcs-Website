/**
 * Renders one JSON-LD graph node.
 *
 * `JSON.stringify` cannot emit `</script`, and every value we pass comes from
 * the content module rather than user input, so this is safe. `<` is still
 * escaped defensively in case real copy ever contains it.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
