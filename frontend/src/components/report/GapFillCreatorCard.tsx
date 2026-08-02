/**
 * frontend/src/components/report/GapFillCreatorCard.tsx
 * -------------------------------------------------------
 * Visually distinct from main CreatorCard.
 * Explicit label: this creator appears solely for geographic coverage.
 * Marketer always knows why a creator appears.
 */

import SignalTierBlock from "./SignalTierBlock";
import RisksBlock from "./RisksBlock";
import CampaignConceptBlock from "./CampaignConceptBlock";

interface Props {
  creator: Record<string, unknown>;
  market: string;
}

export default function GapFillCreatorCard({ creator, market }: Props) {
  const justification = creator.justification as Record<string, string> | undefined;
  const dimensionScores = (creator.dimension_scores as unknown[]) ?? [];

  return (
    <div className="gap-fill-card mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
          Suggested for geographic coverage — {market}
        </span>
      </div>
      <p className="text-xs text-amber-700 mb-4">
        This creator did not rank in the main shortlist and appears here solely because
        the shortlist has no meaningful reach in {market}.
      </p>

      <h3 className="text-base font-semibold text-gray-900 mb-3">
        {creator.channel_name as string}
      </h3>

      <SignalTierBlock dimensionScores={dimensionScores} />

      {justification?.dimension_highlights && (
        <p className="text-sm text-gray-600 mt-3">{justification.dimension_highlights}</p>
      )}

      <RisksBlock risks={justification?.risks} />

      {creator.campaign_concept && (
        <CampaignConceptBlock concept={creator.campaign_concept as string} />
      )}
    </div>
  );
}
