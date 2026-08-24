import { namedClients } from "@/lib/content/gamcs";

/**
 * The only clients named anywhere on the live site (both appear as testimonial
 * sources). No invented companies, no placeholder marks — the label is the one
 * piece of new wording, and it makes no claim the names don't already support.
 */
export default function CustomerLogoRow() {
  return (
    <div className="hero-clients">
      <div className="container clients-row" aria-label="Clients">
        {namedClients
          .flatMap((c) => [c.name, c.region])
          .map((v, i) => (
            <span className="client" key={v}>
              {v}
            </span>
          ))}
      </div>
    </div>
  );
}
