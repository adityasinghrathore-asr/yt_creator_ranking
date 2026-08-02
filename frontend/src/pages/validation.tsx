/**
 * frontend/src/pages/validation.tsx
 * ------------------------------------
 * Real-world validation experience. Separate entry point from the brief flow.
 */

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import ValidationEntryForm from "@/components/validation/ValidationEntryForm";
import ValidationReport from "@/components/validation/ValidationReport";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useSubmitValidation } from "@/hooks/useValidation";

export default function ValidationPage() {
  const [assessment, setAssessment] = useState<Record<string, unknown> | null>(null);
  const submit = useSubmitValidation();

  async function handleSubmit(brandName: string, creatorName: string) {
    const result = await submit.mutateAsync({ brand_name: brandName, creator_name: creatorName });
    setAssessment(result as Record<string, unknown>);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Validate a creator
        </h2>
        {!assessment && (
          <ValidationEntryForm onSubmit={handleSubmit} isLoading={submit.isPending} />
        )}
        {submit.isPending && <LoadingSpinner />}
        {assessment && (
          <ValidationReport
            assessment={assessment}
            onReset={() => setAssessment(null)}
          />
        )}
      </main>
    </div>
  );
}
