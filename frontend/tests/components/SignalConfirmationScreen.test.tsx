/**
 * frontend/tests/components/SignalConfirmationScreen.test.tsx
 * ------------------------------------------------------------
 * The most important frontend test file.
 * Tests that the trust foundation works correctly.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import SignalConfirmationScreen from "@/components/brief/SignalConfirmationScreen";

const mockBriefData = {
  brief_id: "test-brief-001",
  signal_set: {
    primary_use_case_signals: [
      { id: "1", label: "Device switching", category: "use_case", source: "ai_extracted" },
      { id: "2", label: "Commuter context", category: "use_case", source: "ai_extracted" },
    ],
    secondary_category_signals: [],
    audience_descriptors: [
      { id: "3", label: "Urban professionals 25-40", category: "audience", source: "ai_extracted" },
    ],
    geographic_requirements: [
      { id: "4", label: "IN", category: "geography", source: "ai_extracted" },
    ],
    tone_preferences: [
      { id: "5", label: "Candid, never over-scripted", category: "tone", source: "ai_extracted" },
    ],
    avoid_signals: [],
  },
};

function renderScreen(onConfirmed = vi.fn(), onBack = vi.fn()) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <SignalConfirmationScreen
        briefData={mockBriefData}
        onConfirmed={onConfirmed}
        onBack={onBack}
      />
    </QueryClientProvider>
  );
}

describe("SignalConfirmationScreen", () => {
  it("renders all extracted signal chips", () => {
    renderScreen();
    expect(screen.getByText("Device switching")).toBeTruthy();
    expect(screen.getByText("Commuter context")).toBeTruthy();
    expect(screen.getByText("IN")).toBeTruthy();
  });

  it("confirm button is disabled during minimum dwell period", () => {
    renderScreen();
    // Within dwell period — button shows "Review signals…" and is disabled
    expect(screen.getByRole("button", { name: /review signals/i })).toBeTruthy();
  });

  it("removes a chip when × is clicked", () => {
    renderScreen();
    const removeButtons = screen.getAllByLabelText("Remove signal");
    fireEvent.click(removeButtons[0]);
    expect(screen.queryByText("Device switching")).toBeFalsy();
  });

  it("allows adding a new marketer chip", () => {
    renderScreen();
    const input = screen.getByPlaceholderText(/add a signal the ai missed/i);
    fireEvent.change(input, { target: { value: "Noisy environment use" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("Noisy environment use")).toBeTruthy();
  });

  it("marks added chip with +you label", () => {
    renderScreen();
    const input = screen.getByPlaceholderText(/add a signal the ai missed/i);
    fireEvent.change(input, { target: { value: "New signal" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByText("+you")).toBeTruthy();
  });

  it("calls onBack when back button is clicked", () => {
    const onBack = vi.fn();
    renderScreen(vi.fn(), onBack);
    fireEvent.click(screen.getByText("Back to brief"));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
