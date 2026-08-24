import { CardIcon } from "../icons";
import { services } from "@/lib/content/gamcs";

/** Technology solutions, verbatim from the live site. No sample figures. */
export default function JournalEntryCard() {
  return (
    <div className="card card2" data-card="journal">
      <div className="card-head">
        <CardIcon /> Technology Solutions
      </div>
      <ul className="card-list">
        {services.technology.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
