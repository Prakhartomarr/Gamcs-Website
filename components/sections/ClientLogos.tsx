import Image from "next/image";
import { clients } from "@/lib/content/gamcs";

/**
 * The client logo wall that sits in the band under the hero, replacing the
 * platform trust bar that used to occupy this slot.
 *
 * A static five-across grid, no marquee: with 25 marks a loop would mean most
 * of the list is off screen at any moment, and this row is the page's social
 * proof — it should be readable at a glance, not waited for.
 *
 * Logos are plain `next/image` at their processed 2x size. They are decorative
 * in the sense that the section works without any single one of them, but each
 * carries its company name as alt text: a screen-reader user should get the
 * client list, which is the whole point of the section.
 */
export default function ClientLogos() {
  return (
    <section className="clients" id="clients" aria-labelledby="clients-heading">
      <div className="container">
        <div className="clients-head reveal">
          <h2 id="clients-heading">{clients.heading}</h2>
          <p>{clients.subtitle}</p>
        </div>

        <ul className="clients-grid reveal">
          {clients.logos.map((logo) => (
            <li key={logo.file} className={logo.tile ? "is-tile" : undefined}>
              <Image
                src={`/logos/clients/${logo.file}`}
                alt={logo.name}
                width={400}
                height={168}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
