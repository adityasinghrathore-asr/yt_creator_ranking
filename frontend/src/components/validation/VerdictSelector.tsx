/**
 * frontend/src/components/validation/VerdictSelector.tsx
 * --------------------------------------------------------
 * Marketer must make an active verdict choice.
 * No pre-selection, even if AI has a suggestion.
 * OverrideReasonSelector appears only when verdict differs from AI suggestion.
 */

import { useState } from "react";
import { useSubmitVerdict } from "@/hooks/useValidation";
import OverrideReasonSelector from "./OverrideReasonSelector";

const VERDICTS = ["Pursue", "Reconsider", "Reject"] as const;
type Verdict = (typeof VERDICTS)[number];

interface Props {
  validationId: string;
  aiSuggestedVerdict: string;
}

export default function VerdictSelector({ validationId, aiSuggestedVerdict }: Props) {
  const [selected, setSelected] = useState<Verdict | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const submitVerdict = useSubmitVerdict();

  const isOverride = selected !== null && selected !== aiSuggestedVerdict;

  async function handleConfirm() {
    if (!selected) return;
    await submitVerdict.mutateAsync({ validationId, verdict: selected });
    if (!isOverride) setConfirmed(true);
  }

  if (confirmed && !isOverride) {
    return (
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <p className="text-sm text-green-700 font-medium">
          Verdict recorded: {selected}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-gray-700 mb-3">Your verdict</p>
      <div className="flex gap-3">
        {VERDICTS.map((v) => (
          <button
            key={v}
            onClick={() => setSelected(v)}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              selected === v
                ? v === "Pursue"
                  ? "bg-green-600 text-white border-green-600"
                  : v === "Reconsider"
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-red-600 text-white border-red-600"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selected || submitVerdict.isPending}
        className="w-full mt-3 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
      >
        {submitVerdict.isPending ? "Confirming…" : "Confirm verdict"}
      </button>

      {isOverride && (
        <OverrideReasonSelector
          validationId={validationId}
          onComplete={() => setConfirmed(true)}
        />
      )}
    </div>
  );
}
