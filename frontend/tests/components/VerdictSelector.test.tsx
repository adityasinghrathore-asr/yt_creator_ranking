/**
 * frontend/tests/components/VerdictSelector.test.tsx
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import VerdictSelector from "@/components/validation/VerdictSelector";

function renderSelector(aiVerdict = "Pursue") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <VerdictSelector validationId="val-001" aiSuggestedVerdict={aiVerdict} />
    </QueryClientProvider>
  );
}

describe("VerdictSelector", () => {
  it("renders all three verdict options", () => {
    renderSelector();
    expect(screen.getByRole("button", { name: "Pursue" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reconsider" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reject" })).toBeTruthy();
  });

  it("no verdict is pre-selected on mount", () => {
    renderSelector("Pursue");
    // Confirm button should be disabled — no selection yet
    const confirmButton = screen.getByRole("button", { name: /confirm verdict/i });
    expect(confirmButton.hasAttribute("disabled")).toBe(true);
  });

  it("confirm button is disabled until a verdict is selected", () => {
    renderSelector();
    const confirmButton = screen.getByRole("button", { name: /confirm verdict/i });
    expect(confirmButton.hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Pursue" }));
    expect(confirmButton.hasAttribute("disabled")).toBe(false);
  });

  it("OverrideReasonSelector does not appear when no verdict selected", () => {
    renderSelector("Pursue");
    expect(screen.queryByText(/differs from the ai suggestion/i)).toBeFalsy();
  });

  it("OverrideReasonSelector appears when marketer verdict differs from AI suggestion", () => {
    renderSelector("Pursue"); // AI says Pursue
    fireEvent.click(screen.getByRole("button", { name: "Reject" })); // marketer picks Reject
    fireEvent.click(screen.getByRole("button", { name: /confirm verdict/i }));
    expect(screen.getByText(/differs from the ai suggestion/i)).toBeTruthy();
  });

  it("OverrideReasonSelector does not appear when verdict matches AI suggestion", () => {
    renderSelector("Pursue");
    fireEvent.click(screen.getByRole("button", { name: "Pursue" }));
    expect(screen.queryByText(/differs from the ai suggestion/i)).toBeFalsy();
  });
});
