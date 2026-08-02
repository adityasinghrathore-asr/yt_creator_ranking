/**
 * frontend/src/hooks/useValidation.ts
 * --------------------------------------
 * Hooks for the real-world validation experience.
 */

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSubmitValidation() {
  return useMutation({
    mutationFn: (payload: { brand_name: string; creator_name: string }) =>
      api.post("/validation", payload),
  });
}

export function useSubmitVerdict() {
  return useMutation({
    mutationFn: ({
      validationId,
      verdict,
    }: {
      validationId: string;
      verdict: string;
    }) => api.post(`/validation/${validationId}/verdict`, { verdict }),
  });
}

export function useSubmitOverrideReason() {
  return useMutation({
    mutationFn: ({
      validationId,
      reason,
      freeText,
    }: {
      validationId: string;
      reason: string;
      freeText?: string;
    }) =>
      api.post(`/validation/${validationId}/override-reason`, {
        reason,
        free_text: freeText,
      }),
  });
}
