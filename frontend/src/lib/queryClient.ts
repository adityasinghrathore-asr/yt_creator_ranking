/**
 * frontend/src/lib/queryClient.ts
 * ---------------------------------
 * TanStack Query client with stale times appropriate to each data type.
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 0, // overridden per query key below
    },
  },
});

/** Query key → stale time mapping */
export const STALE_TIMES = {
  /** Brief data is fresh indefinitely within a session — marketer triggers recalculations explicitly */
  brief: Infinity,
  /** Creator profiles stale after 48 hours — matches Creator Index refresh cadence */
  creators: 1000 * 60 * 60 * 48,
  /** Scoring results are immediately stale — always refetch after recalculation */
  scoring: 0,
  /** Validation assessments are session-scoped */
  validation: Infinity,
} as const;
