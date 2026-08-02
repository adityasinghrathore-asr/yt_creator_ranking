/**
 * frontend/src/components/validation/OverrideReasonSelector.tsx
 * ---------------------------------------------------------------
 * Shown only when marketer's verdict differs from AI suggestion.
 * Confirm disabled until a reason is selected.
 */

import { useState } from "react";
import { useSubmitOverrideReason } from "@/hooks/useValidation";

const REASONS = [
  "Direct relationship with this creator",
  "Additional context not in the AI assessment",
  "Campaign strategy requires this creator specifically",
  "Disagreeing with the signal interpretation",
  "Other",
] as const;

interface Props {
  validationId: string;
  onComplete: () => void;
}

export default function OverrideReasonSelector({ validationId, onComplete }: Props) {
  const [reason, setReason] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");
  const submit = useSubmitOverrideReason();

  async function handleSubmit() {
    if (!reason) return;
    await submit.mutateAsync({ validationId, reason, freeText: freeText || undefined });
    onComplete();
  }

  return (
    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-4">
      <p className="text-sm font-medium text-amber-800 mb-3">
        Your verdict differs from the AI suggestion. Please select a reason:
      </p>
      <div className="space-y-2">
        {REASONS.map((r) => (
          <label key={r} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="override_reason"
              value={r}
              checked={reason === r}
              onChange={() => setReason(r)}
            />
            <span className="text-sm text-gray-700">{r}</span>
          </label>
        ))}
      </div>
      {reason === "Other" && (
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="Please describe..."
          rows={2}
          className="w-full mt-3 border border-gray-300 rounded px-3 py-2 text-sm"
        />
      )}
      <button
        onClick={handleSubmit}
        disabled={!reason || submit.isPending}
        className="mt-3 w-full py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-40"
      >
        {submit.isPending ? "Submitting…" : "Submit override reason"}
      </button>
    </div>
  );
}
