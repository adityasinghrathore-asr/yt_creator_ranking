/**
 * frontend/src/lib/formatters.ts
 * --------------------------------
 * Pure formatting functions used across multiple components.
 * Tier-to-colour mapping consumed by TierBadge.
 */

/** 78000 → "78K", 8200000 → "8.2M" */
export function formatSubscribers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
  return String(count);
}

/** 0.104 → "10.4%" */
export function formatEngagementRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/** 82.4 → "82 / 100" */
export function formatCCMS(score: number): string {
  return `${Math.round(score)} / 100`;
}

/** ISO date string → "Aug 2, 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type SignalTier = "High" | "Medium" | "Low";
export type PartnershipTier = "Platinum" | "Gold" | "Silver" | "Bronze";

/** Signal tier → Tailwind class */
export function signalTierClass(tier: SignalTier): string {
  const map: Record<SignalTier, string> = {
    High: "signal-chip--high",
    Medium: "signal-chip--medium",
    Low: "signal-chip--low",
  };
  return map[tier] ?? "signal-chip--medium";
}

/** Partnership tier → hex colour (matches tailwind.config.ts) */
export function partnershipTierColor(tier: PartnershipTier): string {
  const map: Record<PartnershipTier, string> = {
    Platinum: "#7C3AED",
    Gold: "#D97706",
    Silver: "#6B7280",
    Bronze: "#92400E",
  };
  return map[tier] ?? "#6B7280";
}

/** Partnership tier → background class */
export function partnershipTierBgClass(tier: PartnershipTier): string {
  const map: Record<PartnershipTier, string> = {
    Platinum: "bg-violet-100 text-violet-800 border-violet-300",
    Gold: "bg-amber-100 text-amber-800 border-amber-300",
    Silver: "bg-gray-100 text-gray-700 border-gray-300",
    Bronze: "bg-orange-100 text-orange-800 border-orange-300",
  };
  return map[tier] ?? "bg-gray-100 text-gray-700";
}
