/**
 * frontend/tests/hooks/useScoring.test.ts
 * ------------------------------------------
 * Tests scoring run and recalculation hooks with mocked API responses.
 * Verifies scoring diff is written to session store after recalculation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
    put: vi.fn(),
    get: vi.fn(),
  },
}));

import { api } from "@/lib/api";
import { useRunScoring, useRecalculate } from "@/hooks/useScoring";
import { useSessionStore } from "@/stores/sessionStore";

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

const mockShortlist = {
  shortlist_id: "sl-001",
  brief_id: "brief-abc",
  version: 1,
  creators: [],
  geography: { priority_markets: [], covered_markets: [], gap_markets: [], gap_fill_creator_ids: [] },
};

const mockDiff = {
  shortlist: mockShortlist,
  changes: [
    {
      creator_id: "c1",
      channel_name: "Everyday Arjun",
      previous_rank: 3,
      new_rank: 1,
      previous_ccms: 71.0,
      new_ccms: 79.2,
      explanation: "Use-case alignment signal strengthened after brief edit.",
    },
  ],
  recalculation_trigger: "brief_edit",
};

describe("useRunScoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.getState().reset();
  });

  it("increments shortlist version on success", async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockShortlist);

    const { result } = renderHook(() => useRunScoring(), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync("brief-abc");
    });

    expect(useSessionStore.getState().shortlistVersion).toBe(1);
  });
});

describe("useRecalculate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.getState().reset();
  });

  it("writes scoring diff to session store after recalculation", async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockDiff);

    const { result } = renderHook(() => useRecalculate(), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync("brief-abc");
    });

    const diff = useSessionStore.getState().scoringDiff;
    expect(diff.length).toBe(1);
    expect(diff[0].creator_id).toBe("c1");
    expect(diff[0].previous_rank).toBe(3);
    expect(diff[0].new_rank).toBe(1);
  });

  it("increments shortlist version on successful recalculation", async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockDiff);

    const { result } = renderHook(() => useRecalculate(), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync("brief-abc");
    });

    expect(useSessionStore.getState().shortlistVersion).toBe(1);
  });
});
