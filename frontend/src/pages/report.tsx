/**
 * frontend/src/pages/report.tsx
 * --------------------------------
 * Ranked creator report page. Single scrollable surface.
 */

import { useRouter } from "next/router";
import PageHeader from "@/components/shared/PageHeader";
import RankedCreatorReport from "@/components/report/RankedCreatorReport";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { useShortlist } from "@/hooks/useScoring";

export default function ReportPage() {
  const router = useRouter();
  const shortlistId = router.query.shortlist as string | undefined;
  const { data, isLoading, isError, error, refetch } = useShortlist(shortlistId ?? null);

  if (!shortlistId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader />
        <main className="max-w-3xl mx-auto px-6 py-10">
          <p className="text-gray-500">No shortlist selected. Start from a campaign brief.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      <main className="max-w-5xl mx-auto px-6 py-10">
        {isLoading && <LoadingSpinner />}
        {isError && (
          <ErrorState
            message="Could not load the shortlist."
            detail={String(error)}
            onRetry={() => refetch()}
          />
        )}
        {data && <RankedCreatorReport shortlist={data as Record<string, unknown>} />}
      </main>
    </div>
  );
}
