/**
 * frontend/tests/hooks/useBrief.test.ts
 * ----------------------------------------
 * Tests brief submission and confirmation hooks with mocked API responses.
 * Verifies that confirmed signal set is written to session store on success.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";

// Mock the API module
vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
    put: vi.fn(),
    get: vi.fn(),
  },
}));

import { api } from "@/lib/api";
import { useSubmitBrief, useConfirmBrief } from "@/hooks/useBrief";
import { useSessionStore } from "@/stores/sessionStore";

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

const mockBriefResponse = {
  brief_id: "brief-abc",
  campaign_objective: "awareness",
  signal_set: {
    brief_id: "brief-abc",
    primary_use_case_signals: [
      { id: "s1", label: "Device switching", category: "use_case", source: "ai_extracted" },
    ],
    secondary_category_signals: [],
    audience_descriptors: [],
    geographic_requirements: [],
    tone_preferences: [],
    avoid_signals: [],
  },
  confirmed: false,
};

describe("useSubmitBrief", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.getState().reset();
  });

  it("sets briefId in session store on success", async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockBriefResponse);

    const { result } = renderHook(() => useSubmitBrief(), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ campaign_objective: "awareness" });
    });

    expect(useSessionStore.getState().briefId).toBe("brief-abc");
  });

  it("does not set briefId if API call fails", async () => {
    (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useSubmitBrief(), { wrapper: makeWrapper() });

    await act(async () => {
      try {
        await result.current.mutateAsync({});
      } catch {
        // expected
      }
    });

    expect(useSessionStore.getState().briefId).toBeNull();
  });
});

describe("useConfirmBrief", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.getState().reset();
  });

  it("writes confirmed signals to session store on success", async () => {
    const confirmed = { ...mockBriefResponse, confirmed: true };
    (api.put as ReturnType<typeof vi.fn>).mockResolvedValue(confirmed);

    const { result } = renderHook(() => useConfirmBrief(), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        briefId: "brief-abc",
        signalSet: mockBriefResponse.signal_set,
      });
    });

    const signals = useSessionStore.getState().confirmedSignals;
    expect(signals.length).toBeGreaterThan(0);
    expect(signals[0].label).toBe("Device switching");
  });
});
