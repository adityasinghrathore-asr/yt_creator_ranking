/**
 * frontend/tests/components/BriefForm.test.tsx
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import BriefForm from "@/components/brief/BriefForm";

function renderForm(onInterpreted = vi.fn()) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BriefForm onInterpreted={onInterpreted} />
    </QueryClientProvider>
  );
}

describe("BriefForm", () => {
  it("renders the form mode by default", () => {
    renderForm();
    expect(screen.getByText("Campaign objective")).toBeTruthy();
  });

  it("switches to paste mode", () => {
    renderForm();
    fireEvent.click(screen.getByText("Paste brief"));
    expect(screen.getByPlaceholderText(/paste your campaign brief/i)).toBeTruthy();
  });

  it("disables submit button when required fields are empty", () => {
    renderForm();
    const button = screen.getByRole("button", { name: /interpret brief/i });
    expect(button).toBeTruthy();
  });

  it("shows structured form fields in form mode", () => {
    renderForm();
    expect(screen.getByText("Target audience")).toBeTruthy();
    expect(screen.getByText("Priority markets (comma-separated)")).toBeTruthy();
    expect(screen.getByText("Desired tone")).toBeTruthy();
  });
});
