/**
 * frontend/src/components/report/SignalTierBlock.tsx
 * ----------------------------------------------------
 * Renders dimension score chips. Each chip shows:
 *   - dimension name
 *   - High / Medium / Low tier
 *   - inference source label
 * Transparency is a property of each signal chip, not a page-level disclaimer.
 */

import { signalTierClass } from "@/lib/formatters";

interface DimensionScore {
  dimension: string;
  raw_score: number;
  weight: number;
  weighted_contribution: number;
  tier?: string;
  inference_source?: string;
}

interface Props {
  dimensionScores: unknown[];
}

const DIMENSION_LABELS: Record<string, string> = {
  audience_fit: "Audience fit",
  engagement_quality: "Engagement quality",
  content_style_fit: "Content & style",
  brand_safety: "Brand safety",
  operational_fit: "Operational fit",
};

function scoreToTier(score: number): "High" | "Medium" | "Low" {
  if (score >= 70) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}

export default function SignalTierBlock({ dimensionScores }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {(dimensionScores as DimensionScore[]).map((d) => {
        const tier = d.tier ?? scoreToTier(d.raw_score);
        const label = DIMENSION_LABELS[d.dimension] ?? d.dimension;
        const source = d.inference_source ?? "inferred from public content";
        return (
          <div
            key={d.dimension}
            className={`signal-chip ${signalTierClass(tier as "High" | "Medium" | "Low")}`}
            title={`Inference source: ${source}`}
          >
            <span>{label}</span>
            <span className="opacity-60 mx-1">·</span>
            <span>{tier}</span>
            <span className="opacity-40 text-xs ml-1">({source})</span>
          </div>
        );
      })}
    </div>
  );
}
