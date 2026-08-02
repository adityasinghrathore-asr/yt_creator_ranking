/**
 * frontend/src/components/validation/ValidationReport.tsx
 */

import SignalTierBlock from "@/components/report/SignalTierBlock";
import RisksBlock from "@/components/report/RisksBlock";
import VerdictSelector from "./VerdictSelector";
import DataUnavailablePlaceholder from "./DataUnavailablePlaceholder";

interface Props {
  assessment: Record<string, unknown>;
  onReset: () => void;
}

export default function ValidationReport({ assessment, onReset }: Props) {
  const signalTiers = (assessment.signal_tiers as unknown[]) ?? [];
  const unavailable = (assessment.unavailable_signals as unknown[]) ?? [];
  const aiVerdict = assessment.ai_suggested_verdict as string;
  const validationId = assessment.validation_id as string;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {assessment.creator_name as string}
          </h3>
          <p className="text-sm text-gray-400">for {assessment.brand_name as string}</p>
        </div>
        <button onClick={onReset} className="text-sm text-gray-400 hover:text-gray-600 underline">
          New validation
        </button>
      </div>

      <SignalTierBlock dimensionScores={signalTiers} />

      {unavailable.length > 0 && (
        <div className="mt-4 space-y-2">
          {(unavailable as Array<Record<string, unknown>>).map((u, i) => (
            <DataUnavailablePlaceholder key={i} placeholder={u} />
          ))}
        </div>
      )}

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          AI suggested verdict
        </p>
        <p className={`text-sm font-semibold ${
          aiVerdict === "Pursue" ? "text-green-700"
          : aiVerdict === "Reconsider" ? "text-amber-700"
          : "text-red-700"
        }`}>
          {aiVerdict}
        </p>
      </div>

      <RisksBlock />

      <VerdictSelector
        validationId={validationId}
        aiSuggestedVerdict={aiVerdict}
      />
    </div>
  );
}
