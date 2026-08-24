import ReconciliationCard from "./cards/ReconciliationCard";
import JournalEntryCard from "./cards/JournalEntryCard";
import AIInsightCard from "./cards/AIInsightCard";

/**
 * The 3D card cluster. Base rotation is CSS; the entrance, the hover lift and
 * the pointer tilt are all written by GSAP (one owner for `transform`).
 * Illumination is toggled by class from HeroChips — no React state, so hovering
 * a chip never re-renders this tree.
 */
export default function ProductCardStack() {
  return (
    <div className="cards">
      <div className="cards-tilt">
        <ReconciliationCard />
        <JournalEntryCard />
        <AIInsightCard />
      </div>
    </div>
  );
}
