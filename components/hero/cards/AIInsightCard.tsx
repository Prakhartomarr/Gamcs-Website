import { CardIcon } from "../icons";
import { services } from "@/lib/content/gamcs";

/** Business solutions, verbatim from the live site. No sample figures. */
export default function AIInsightCard() {
  return (
    <div className="card card1" data-card="flux">
      <div className="card-head">
        <CardIcon /> Business Solutions
      </div>
      <ul className="card-list">
        {services.business.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
