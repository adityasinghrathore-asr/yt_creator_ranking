/**
 * frontend/src/components/shared/ErrorState.tsx
 * -----------------------------------------------
 * Errors are never vague. Always describes what happened and what to do.
 */

interface Props {
  message: string;
  detail?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, detail, onRetry }: Props) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-4 my-4">
      <p className="text-sm font-semibold text-red-700">{message}</p>
      {detail && <p className="text-xs text-red-600 mt-1">{detail}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-xs text-red-600 underline hover:text-red-800"
        >
          Try again
        </button>
      )}
    </div>
  );
}
