/**
 * frontend/src/components/report/RisksBlock.tsx
 * -----------------------------------------------
 * Always rendered on every creator card, regardless of score.
 * Includes the required inference and commercial effectiveness disclaimer.
 */

interface Props {
  risks?: string;
}

export default function RisksBlock({ risks }: Props) {
  return (
    <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
      <p className="text-xs font-semibold text-amber-700 mb-1 uppercase tracking-wide">
        Risks & considerations
      </p>
      {risks ? (
        <p className="text-sm text-amber-800">{risks}</p>
      ) : (
        <p className="text-sm text-amber-700 italic">No risks flagged.</p>
      )}
      <p className="text-xs text-amber-600 mt-2">
        All signal tiers are inferred from public content, not verified creator data.
        Commercial effectiveness cannot be predicted from these signals.
      </p>
    </div>
  );
}
