/**
 * frontend/src/components/report/GeographyCoverageBar.tsx
 * ---------------------------------------------------------
 * Geographic portfolio coverage assessment below the main shortlist.
 */

interface Geography {
  priority_markets: string[];
  covered_markets: string[];
  gap_markets: string[];
  gap_fill_creator_ids: string[];
}

interface Props {
  geography: Record<string, unknown>;
}

export default function GeographyCoverageBar({ geography }: Props) {
  const geo = geography as unknown as Geography;

  if (!geo.priority_markets?.length) return null;

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Geographic portfolio coverage
      </h4>
      <div className="flex flex-wrap gap-2">
        {geo.priority_markets.map((market) => {
          const covered = geo.covered_markets.includes(market);
          return (
            <span
              key={market}
              className={`px-3 py-1 rounded-full text-sm border ${
                covered
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {covered ? "✓" : "✗"} {market}
            </span>
          );
        })}
      </div>
      {geo.gap_markets.length > 0 && (
        <p className="text-xs text-gray-500 mt-3">
          Gap-fill creators suggested below for: {geo.gap_markets.join(", ")}
        </p>
      )}
    </div>
  );
}
