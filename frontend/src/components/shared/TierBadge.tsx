/**
 * frontend/src/components/shared/TierBadge.tsx
 * ----------------------------------------------
 * Partnership and creator tier badges.
 * Colour scheme from tailwind.config.ts — change once, propagates everywhere.
 */

import { partnershipTierBgClass } from "@/lib/formatters";

interface Props {
  tier: string;
  size?: "sm" | "md";
}

export default function TierBadge({ tier, size = "md" }: Props) {
  const colorClass = partnershipTierBgClass(tier as "Platinum" | "Gold" | "Silver" | "Bronze");
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${colorClass} ${sizeClass}`}>
      {tier}
    </span>
  );
}
