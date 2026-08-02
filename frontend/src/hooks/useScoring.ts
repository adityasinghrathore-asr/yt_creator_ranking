/**
 * frontend/src/hooks/useScoring.ts
 * ----------------------------------
 * TanStack Query hooks for scoring operations.
 * Recalculation hook writes the diff to session store for ChangeAnnotation components.
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { STALE_TIMES, queryClient } from "@/lib/queryClient";
import { useSessionStore } from "@/stores/sessionStore";

export function useRunScoring() {
  const incrementVersion = useSessionStore((s) => s.incrementShortlistVersion);

  return useMutation({
    mutationFn: (briefId: string) =>
      api.post(`/scoring/run?brief_id=${briefId}`, {}),
    onSuccess: (data: { shortlist_id: string }) => {
      incrementVersion();
      queryClient.setQueryData(["shortlist", data.shortlist_id], data);
    },
  });
}

export function useShortlist(shortlistId: string | null) {
  return useQuery({
    queryKey: ["shortlist", shortlistId],
    queryFn: () => api.get(`/scoring/${shortlistId}`),
    enabled: !!shortlistId,
    staleTime: STALE_TIMES.scoring,
  });
}

export function useRecalculate() {
  const setScoringDiff = useSessionStore((s) => s.setScoringDiff);
  const incrementVersion = useSessionStore((s) => s.incrementShortlistVersion);

  return useMutation({
    mutationFn: (briefId: string) =>
      api.post(`/scoring/recalculate?brief_id=${briefId}`, {}),
    onSuccess: (data: { changes: unknown[] }) => {
      setScoringDiff(
        (data.changes ?? []) as Array<{
          creator_id: string;
          channel_name: string;
          previous_rank: number;
          new_rank: number;
          explanation: string;
        }>
      );
      incrementVersion();
    },
  });
}

export function useScoreOverride() {
  return useMutation({
    mutationFn: ({
      creatorId,
      payload,
    }: {
      creatorId: string;
      payload: Record<string, unknown>;
    }) => api.put(`/scoring/${creatorId}/override`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortlist"] });
    },
  });
}
