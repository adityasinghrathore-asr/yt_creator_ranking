/**
 * frontend/src/hooks/useBrief.ts
 * --------------------------------
 * TanStack Query hooks for brief operations.
 * On successful confirmation, writes the confirmed signal set to the session store
 * so LoadingSequence can access it without an additional API call.
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { STALE_TIMES, queryClient } from "@/lib/queryClient";
import { useSessionStore } from "@/stores/sessionStore";

export function useSubmitBrief() {
  const setBriefId = useSessionStore((s) => s.setBriefId);

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post("/brief", payload),
    onSuccess: (data: { brief_id: string }) => {
      setBriefId(data.brief_id);
      queryClient.setQueryData(["brief", data.brief_id], data);
    },
  });
}

export function useSubmitBriefPaste() {
  const setBriefId = useSessionStore((s) => s.setBriefId);

  return useMutation({
    mutationFn: (rawText: string) =>
      api.post("/brief/paste", { raw_text: rawText }),
    onSuccess: (data: { brief_id: string }) => {
      setBriefId(data.brief_id);
      queryClient.setQueryData(["brief", data.brief_id], data);
    },
  });
}

export function useBrief(briefId: string | null) {
  return useQuery({
    queryKey: ["brief", briefId],
    queryFn: () => api.get(`/brief/${briefId}`),
    enabled: !!briefId,
    staleTime: STALE_TIMES.brief,
  });
}

export function useConfirmBrief() {
  const setConfirmedSignals = useSessionStore((s) => s.setConfirmedSignals);

  return useMutation({
    mutationFn: ({
      briefId,
      signalSet,
    }: {
      briefId: string;
      signalSet: Record<string, unknown>;
    }) => api.put(`/brief/${briefId}`, signalSet),
    onSuccess: (data: { signal_set: { primary_use_case_signals: unknown[] } }) => {
      // Write all confirmed signal chips to session store for LoadingSequence
      const allSignals = [
        ...(data.signal_set?.primary_use_case_signals ?? []),
      ] as Array<{ id: string; label: string; category: string; source: string }>;
      setConfirmedSignals(allSignals);
    },
  });
}
