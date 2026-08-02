/**
 * frontend/src/hooks/useExport.ts
 * ---------------------------------
 * Hooks for export operations and shortlist approval.
 * On approval, locks the session store to disable further modifications.
 */

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSessionStore } from "@/stores/sessionStore";

export function useExportJSON() {
  return useMutation({
    mutationFn: (shortlistId: string) =>
      api.post(`/export/${shortlistId}/json`, {}),
  });
}

export function useExportCSV() {
  return useMutation({
    mutationFn: (shortlistId: string) =>
      api.post(`/export/${shortlistId}/csv`, {}),
  });
}

export function useApproveShortlist() {
  const lockShortlist = useSessionStore((s) => s.lockShortlist);

  return useMutation({
    mutationFn: (shortlistId: string) =>
      api.post(`/export/${shortlistId}/approve`, {}),
    onSuccess: () => {
      lockShortlist();
    },
  });
}
