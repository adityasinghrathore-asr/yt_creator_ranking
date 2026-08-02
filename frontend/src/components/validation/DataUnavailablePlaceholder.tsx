/**
 * frontend/src/components/validation/DataUnavailablePlaceholder.tsx
 * -------------------------------------------------------------------
 * Never renders a generic "data not found". Always shows why and what to do.
 */

interface Props {
  placeholder: Record<string, unknown>;
}

export default function DataUnavailablePlaceholder({ placeholder }: Props) {
  return (
    <div className="border border-dashed border-gray-300 rounded-lg px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500">
          {placeholder.signal_name as string}
        </span>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          Data unavailable
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">{placeholder.reason as string}</p>
      {placeholder.suggested_action && (
        <p className="text-xs text-blue-500 mt-1">
          → {placeholder.suggested_action as string}
        </p>
      )}
    </div>
  );
}
