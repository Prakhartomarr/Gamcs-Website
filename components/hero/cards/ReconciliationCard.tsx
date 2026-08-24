import { CardIcon } from "../icons";
import { services } from "@/lib/content/gamcs";

/** Training programs, verbatim from the live site. No sample figures. */
export default function ReconciliationCard() {
  return (
    <div className="card card3" data-card="recon">
      <div className="card-head">
        <CardIcon /> Training Programs
      </div>
      <ul className="card-list">
        {services.training.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
