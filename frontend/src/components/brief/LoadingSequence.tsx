/**
 * frontend/src/components/brief/LoadingSequence.tsx
 * ---------------------------------------------------
 * Dynamic loading sequence derived from the confirmed signal set.
 * Status messages prove to the marketer the system read their specific brief.
 * e.g. "Evaluating commuter and transit context across creators"
 * rather than a generic "Analysing creators…"
 */

import { useEffect, useState } from "react";
import { useSessionStore } from "@/stores/sessionStore";

function buildMessages(signals: Array<{ label: string; category: string }>): string[] {
  const base = [
    "Applying hard filters…",
    "Running structured signal pass on full candidate pool…",
  ];

  const useCase = signals.filter((s) => s.category === "use_case").map((s) => s.label);
  const geo = signals.filter((s) => s.category === "geography").map((s) => s.label);
  const tone = signals.filter((s) => s.category === "tone").map((s) => s.label);

  if (useCase.length > 0) {
    base.push(`Evaluating ${useCase.slice(0, 2).join(" and ")} context across creators…`);
  }
  if (geo.length > 0) {
    base.push(`Checking audience coverage for ${geo.slice(0, 3).join(", ")}…`);
  }
  if (tone.length > 0) {
    base.push(`Assessing tone match — looking for "${tone[0]}"…`);
  }

  base.push(
    "Downloading transcripts for top candidates…",
    "Running use-case alignment scoring…",
    "Generating creator justifications…",
    "Checking geographic portfolio coverage…",
    "Finalising ranked shortlist…"
  );

  return base;
}

export default function LoadingSequence() {
  const confirmedSignals = useSessionStore((s) => s.confirmedSignals);
  const messages = buildMessages(confirmedSignals);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentIndex >= messages.length - 1) {
      setDone(true);
      return;
    }
    const timer = setTimeout(() => setCurrentIndex((i) => i + 1), 1800);
    return () => clearTimeout(timer);
  }, [currentIndex, messages.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-64 py-16">
      <div className="flex gap-1 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-gray-400 animate-pulse-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>

      <div className="space-y-2 text-center max-w-sm">
        {messages.slice(0, currentIndex + 1).map((msg, i) => (
          <p
            key={i}
            className={`text-sm transition-opacity duration-500 ${
              i === currentIndex ? "text-gray-800 font-medium" : "text-gray-400"
            }`}
          >
            {i < currentIndex ? "✓ " : ""}{msg}
          </p>
        ))}
      </div>

      {done && (
        <p className="mt-6 text-xs text-gray-400">Finishing up…</p>
      )}
    </div>
  );
}
