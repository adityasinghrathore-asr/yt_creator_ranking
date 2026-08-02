/**
 * frontend/src/components/report/CampaignConceptBlock.tsx
 */
interface Props { concept: string; }
export default function CampaignConceptBlock({ concept }: Props) {
  return (
    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
        Suggested campaign concept
      </p>
      <p className="text-sm text-gray-700">{concept}</p>
    </div>
  );
}
