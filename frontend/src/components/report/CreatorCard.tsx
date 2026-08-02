/**
 * frontend/src/components/report/CreatorCard.tsx
 * ------------------------------------------------
 * One card per shortlisted creator.
 * Always renders: InferenceBanner, RisksBlock, signal tier chips with source labels.
 * ChangeAnnotation renders when a diff is present for this creator.
 */

import TierBadge from "@/components/shared/TierBadge";
import SignalTierBlock from "./SignalTierBlock";
import RisksBlock from "./RisksBlock";
import CampaignConceptBlock from "./CampaignConceptBlock";
import InferenceBanner from "./InferenceBanner";
import ChangeAnnotation from "./ChangeAnnotation";
import { formatSubscribers, formatCCMS } from "@/lib/formatters";
import { useSessionStore } from "@/stores/sessionStore";

interface Props {
  creator: Record<string, unknown>;
  rank: number;
}

export default function CreatorCard({ creator, rank }: Props) {
  const scoringDiff = useSessionStore((s) => s.scoringDiff);
  const change = scoringDiff.find((d) => d.creator_id === creator.creator_id);

  const metadata = creator.metadata as Record<string, unknown> | undefined;
  const justification = creator.justification as Record<string, string> | undefined;
  const dimensionScores = (creator.dimension_scores as unknown[]) ?? [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-200">#{rank}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {creator.channel_name as string}
            </h3>
            <p className="text-sm text-gray-400">{creator.channel_handle as string}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TierBadge tier={creator.partnership_tier as string} />
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              {formatCCMS(creator.ccms as number)}
            </p>
            <p className="text-xs text-gray-400">CCMS</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {metadata && (
        <div className="flex gap-4 text-sm text-gray-500 mb-4 border-b border-gray-100 pb-4">
          <span>{formatSubscribers(metadata.subscriber_count as number)} subscribers</span>
          <span>{metadata.country as string}</span>
          <span>{metadata.primary_language as string}</span>
        </div>
      )}

      {/* Change annotation — only if this creator's rank changed */}
      {change && <ChangeAnnotation change={change} />}

      {/* Match summary */}
      {justification?.match_summary && (
        <p className="text-sm text-gray-700 mb-4">{justification.match_summary}</p>
      )}

      {/* Signal tier chips — each shows its inference source label */}
      <SignalTierBlock dimensionScores={dimensionScores} />

      {/* Dimension highlights */}
      {justification?.dimension_highlights && (
        <p className="text-sm text-gray-600 mt-3">{justification.dimension_highlights}</p>
      )}

      {/* Risks — always rendered regardless of score */}
      <RisksBlock risks={justification?.risks} />

      {/* Campaign concept */}
      {creator.campaign_concept && (
        <CampaignConceptBlock concept={creator.campaign_concept as string} />
      )}

      {/* Inference banner — rendered on every card, embedded in signal consumption */}
      <InferenceBanner />
    </div>
  );
}
