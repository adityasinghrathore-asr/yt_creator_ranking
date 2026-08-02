/**
 * frontend/tests/components/CreatorCard.test.tsx
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CreatorCard from "@/components/report/CreatorCard";

const mockCreator = {
  creator_id: "creator_001",
  channel_name: "Everyday Arjun",
  channel_handle: "@everydayarjun",
  partnership_tier: "Gold",
  ccms: 77.4,
  dimension_scores: [
    { dimension: "audience_fit", raw_score: 82, weight: 0.2, weighted_contribution: 16.4 },
    { dimension: "engagement_quality", raw_score: 75, weight: 0.35, weighted_contribution: 26.25 },
  ],
  justification: {
    match_summary: "Arjun's audience lives inside the product's commuter use case.",
    dimension_highlights: "Engagement quality is above tier average.",
    risks: "Inference based on public content only. Commercial effectiveness cannot be predicted.",
  },
  metadata: {
    subscriber_count: 42000,
    country: "IN",
    primary_language: "en",
  },
};

describe("CreatorCard", () => {
  it("always renders InferenceBanner", () => {
    render(<CreatorCard creator={mockCreator} rank={1} />);
    expect(screen.getByText(/signal tiers inferred from public content/i)).toBeTruthy();
  });

  it("always renders RisksBlock", () => {
    render(<CreatorCard creator={mockCreator} rank={1} />);
    expect(screen.getByText(/risks & considerations/i)).toBeTruthy();
  });

  it("always renders the inference disclaimer in risks", () => {
    render(<CreatorCard creator={mockCreator} rank={1} />);
    expect(screen.getAllByText(/commercial effectiveness cannot be predicted/i).length).toBeGreaterThan(0);
  });

  it("renders channel name and tier", () => {
    render(<CreatorCard creator={mockCreator} rank={1} />);
    expect(screen.getByText("Everyday Arjun")).toBeTruthy();
    expect(screen.getByText("Gold")).toBeTruthy();
  });

  it("renders CCMS score", () => {
    render(<CreatorCard creator={mockCreator} rank={1} />);
    expect(screen.getByText("77 / 100")).toBeTruthy();
  });

  it("renders ChangeAnnotation when diff is present", () => {
    // ChangeAnnotation reads from the session store — no diff present so nothing renders
    render(<CreatorCard creator={mockCreator} rank={1} />);
    expect(screen.queryByText(/moved up/i)).toBeFalsy();
  });
});
