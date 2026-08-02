/**
 * frontend/src/components/report/ChangeAnnotation.tsx
 * -----------------------------------------------------
 * Renders when a creator's rank changed after a recalculation.
 * Renders nothing when no diff is present for this creator.
 */

interface Change {
  previous_rank: number;
  new_rank: number;
  explanation: string;
}

interface Props {
  change: Change;
}

export default function ChangeAnnotation({ change }: Props) {
  const moved = change.new_rank - change.previous_rank;
  const direction = moved < 0 ? "up" : "down";
  const steps = Math.abs(moved);

  return (
    <div className={`text-xs rounded px-3 py-1.5 mb-3 flex items-center gap-2 ${
      direction === "up"
        ? "bg-green-50 text-green-700 border border-green-200"
        : "bg-red-50 text-red-700 border border-red-200"
    }`}>
      <span>{direction === "up" ? "↑" : "↓"}</span>
      <span>
        Moved {direction} {steps} {steps === 1 ? "position" : "positions"} after
        brief update · {change.explanation}
      </span>
    </div>
  );
}
