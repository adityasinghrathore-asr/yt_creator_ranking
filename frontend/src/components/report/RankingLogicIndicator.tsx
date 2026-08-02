/**
 * frontend/src/components/report/RankingLogicIndicator.tsx
 * ----------------------------------------------------------
 * Static indicator — always in the top-right corner of the report.
 * Describes the three primary signals in plain language.
 * Never changes, never generated dynamically — this is deliberate (see §8.6).
 */

export default function RankingLogicIndicator() {
  return (
    <div className="text-right">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
        Ranking logic
      </p>
      <ol className="text-xs text-gray-500 space-y-0.5">
        <li>1. Use-case alignment</li>
        <li>2. Authentic community engagement</li>
        <li>3. Audience fit for priority markets</li>
      </ol>
    </div>
  );
}
