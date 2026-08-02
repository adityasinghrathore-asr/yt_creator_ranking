/**
 * frontend/src/components/shared/LoadingSpinner.tsx
 * ---------------------------------------------------
 * Generic spinner for fast operations (<2s). Not used for the primary scoring computation.
 */

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
