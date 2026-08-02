/**
 * frontend/src/pages/brief.tsx
 * -----------------------------
 * Brief entry page. Manages the three-step flow:
 *   1. BriefForm (form or paste)
 *   2. SignalConfirmationScreen (AI interpretation review)
 *   3. LoadingSequence (while scoring runs)
 * On completion, navigates to /report.
 */

import { useState } from "react";
import { useRouter } from "next/router";
import PageHeader from "@/components/shared/PageHeader";
import BriefForm from "@/components/brief/BriefForm";
import SignalConfirmationScreen from "@/components/brief/SignalConfirmationScreen";
import LoadingSequence from "@/components/brief/LoadingSequence";
import ErrorState from "@/components/shared/ErrorState";
import { useRunScoring } from "@/hooks/useScoring";

type Step = "form" | "confirm" | "loading";

export default function BriefPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [briefData, setBriefData] = useState<Record<string, unknown> | null>(null);
  const [shortlistId, setShortlistId] = useState<string | null>(null);
  const runScoring = useRunScoring();

  function handleBriefInterpreted(data: Record<string, unknown>) {
    setBriefData(data);
    setStep("confirm");
  }

  async function handleSignalsConfirmed(briefId: string) {
    setStep("loading");
    try {
      const result = await runScoring.mutateAsync(briefId) as { shortlist_id: string };
      setShortlistId(result.shortlist_id);
      router.push(`/report?shortlist=${result.shortlist_id}`);
    } catch {
      setStep("confirm");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      <main className="max-w-3xl mx-auto px-6 py-10">
        {step === "form" && (
          <BriefForm onInterpreted={handleBriefInterpreted} />
        )}
        {step === "confirm" && briefData && (
          <SignalConfirmationScreen
            briefData={briefData}
            onConfirmed={handleSignalsConfirmed}
            onBack={() => setStep("form")}
          />
        )}
        {step === "loading" && <LoadingSequence />}
        {runScoring.isError && (
          <ErrorState
            message="Scoring run failed."
            detail={String(runScoring.error)}
            onRetry={() => setStep("confirm")}
          />
        )}
      </main>
    </div>
  );
}
