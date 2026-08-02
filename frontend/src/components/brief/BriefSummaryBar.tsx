/**
 * frontend/src/components/brief/BriefSummaryBar.tsx
 * ---------------------------------------------------
 * Compact summary of the confirmed brief shown at the top of the report page.
 * "Edit brief" link returns to confirmation step and triggers re-ranking.
 */

interface Props {
  objective: string;
  markets: string[];
  signalCount: number;
  onEdit?: () => void;
}

export default function BriefSummaryBar({ objective, markets, signalCount, onEdit }: Props) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 mb-6 text-sm">
      <div className="flex gap-4 text-gray-600">
        <span>
          <span className="font-medium text-gray-900">Objective:</span>{" "}
          {objective.charAt(0).toUpperCase() + objective.slice(1)}
        </span>
        <span>
          <span className="font-medium text-gray-900">Markets:</span>{" "}
          {markets.join(", ")}
        </span>
        <span>
          <span className="font-medium text-gray-900">Signals:</span>{" "}
          {signalCount} confirmed
        </span>
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-gray-700 underline text-xs"
        >
          Edit brief
        </button>
      )}
    </div>
  );
}
