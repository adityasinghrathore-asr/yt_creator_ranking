/**
 * frontend/src/components/report/RankedCreatorReport.tsx
 * --------------------------------------------------------
 * Single scrollable report page. Opens with ranking logic indicator.
 * Inline note above first card: "Reach was not the primary ranking signal".
 * Geographic gap-fill creators appear below the main list with distinct treatment.
 */

import CreatorCard from "./CreatorCard";
import RankingLogicIndicator from "./RankingLogicIndicator";
import InferenceBanner from "./InferenceBanner";
import GeographyCoverageBar from "./GeographyCoverageBar";
import GapFillCreatorCard from "./GapFillCreatorCard";
import { useApproveShortlist, useExportCSV, useExportJSON } from "@/hooks/useExport";
import { useSessionStore } from "@/stores/sessionStore";

interface Props {
  shortlist: Record<string, unknown>;
}

export default function RankedCreatorReport({ shortlist }: Props) {
  const creators = (shortlist.creators as unknown[]) ?? [];
  const geography = shortlist.geography as Record<string, unknown> | undefined;
  const shortlistId = shortlist.shortlist_id as string;

  const approveShortlist = useApproveShortlist();
  const exportJSON = useExportJSON();
  const exportCSV = useExportCSV();
  const shortlistLocked = useSessionStore((s) => s.shortlistLocked);

  return (
    <div>
      {/* Top bar: ranking logic + static indicator */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Ranked shortlist</h2>
          <p className="text-sm text-gray-500 mt-1">
            {creators.length} creators · ranked by fit, not reach
          </p>
        </div>
        <RankingLogicIndicator />
      </div>

      {/* Persistent inference banner — page level */}
      <InferenceBanner pageLevel />

      {/* Export / approve actions */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => exportJSON.mutate(shortlistId)}
          disabled={exportJSON.isPending}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          Export JSON
        </button>
        <button
          onClick={() => exportCSV.mutate(shortlistId)}
          disabled={exportCSV.isPending}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          Export CSV
        </button>
        {!shortlistLocked && (
          <button
            onClick={() => approveShortlist.mutate(shortlistId)}
            disabled={approveShortlist.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {approveShortlist.isPending ? "Approving…" : "Approve and handoff"}
          </button>
        )}
        {shortlistLocked && (
          <span className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
            ✓ Shortlist approved and locked
          </span>
        )}
      </div>

      {/* Inline reach disclaimer above first card */}
      {creators.length > 0 && (
        <p className="text-sm text-gray-500 mb-3">
          Reach was not the primary ranking signal —{" "}
          <button className="underline hover:text-gray-700">here's why</button>
        </p>
      )}

      {/* Main shortlist */}
      <div className="space-y-4">
        {creators.map((creator, i) => (
          <CreatorCard
            key={(creator as Record<string, unknown>).creator_id as string}
            creator={creator as Record<string, unknown>}
            rank={i + 1}
          />
        ))}
      </div>

      {/* Geographic coverage */}
      {geography && (
        <GeographyCoverageBar geography={geography} />
      )}
    </div>
  );
}
