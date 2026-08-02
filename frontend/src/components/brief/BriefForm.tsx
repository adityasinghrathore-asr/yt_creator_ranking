/**
 * frontend/src/components/brief/BriefForm.tsx
 * ---------------------------------------------
 * Accepts structured form input or free-text paste.
 * Both paths call the backend and pass the interpreted brief up to the page.
 */

import { useState } from "react";
import { useSubmitBrief, useSubmitBriefPaste } from "@/hooks/useBrief";
import ErrorState from "@/components/shared/ErrorState";

interface Props {
  onInterpreted: (briefData: Record<string, unknown>) => void;
}

const OBJECTIVES = ["awareness", "engagement", "conversion", "community", "launch"];
const TIERS = ["nano", "micro", "mid", "macro"];

export default function BriefForm({ onInterpreted }: Props) {
  const [mode, setMode] = useState<"form" | "paste">("form");
  const [pasteText, setPasteText] = useState("");
  const [form, setForm] = useState({
    campaign_objective: "awareness",
    target_audience: "",
    priority_markets: "",
    desired_tone: "",
    key_product_messages: "",
    content_format_preferences: [] as string[],
    things_to_avoid: "",
    creator_tier_preferences: [] as string[],
    shortlist_size_target: 10,
    brand_safety_sensitivity: "standard",
  });

  const submitStructured = useSubmitBrief();
  const submitPaste = useSubmitBriefPaste();

  const isLoading = submitStructured.isPending || submitPaste.isPending;
  const error = submitStructured.error || submitPaste.error;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let result: Record<string, unknown>;

    if (mode === "paste") {
      result = await submitPaste.mutateAsync(pasteText) as Record<string, unknown>;
    } else {
      result = await submitStructured.mutateAsync({
        ...form,
        priority_markets: form.priority_markets.split(",").map((s) => s.trim()),
        key_product_messages: form.key_product_messages.split("\n").filter(Boolean),
        things_to_avoid: form.things_to_avoid.split(",").map((s) => s.trim()),
      }) as Record<string, unknown>;
    }

    onInterpreted(result);
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Campaign Brief</h2>
      <p className="text-gray-500 mb-6">
        Fill in the brief below or paste your existing brief text.
      </p>

      <div className="flex gap-2 mb-6">
        {(["form", "paste"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === m
                ? "bg-gray-900 text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {m === "form" ? "Structured form" : "Paste brief"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "paste" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brief text
            </label>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={10}
              placeholder="Paste your campaign brief here..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
              minLength={50}
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign objective
              </label>
              <select
                value={form.campaign_objective}
                onChange={(e) => setForm({ ...form, campaign_objective: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                {OBJECTIVES.map((o) => (
                  <option key={o} value={o}>
                    {o.charAt(0).toUpperCase() + o.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target audience
              </label>
              <textarea
                value={form.target_audience}
                onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                rows={3}
                placeholder="e.g. Urban professionals 25–40, commuters who switch between devices..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
                minLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority markets (comma-separated)
              </label>
              <input
                type="text"
                value={form.priority_markets}
                onChange={(e) => setForm({ ...form, priority_markets: e.target.value })}
                placeholder="e.g. US, IN, GB, DE"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desired tone
              </label>
              <input
                type="text"
                value={form.desired_tone}
                onChange={(e) => setForm({ ...form, desired_tone: e.target.value })}
                placeholder="e.g. helpful, candid, never over-scripted"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
                minLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key product messages (one per line)
              </label>
              <textarea
                value={form.key_product_messages}
                onChange={(e) => setForm({ ...form, key_product_messages: e.target.value })}
                rows={4}
                placeholder="e.g. Best-in-class call clarity&#10;Seamless device switching&#10;All-day battery"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Things to avoid (comma-separated)
              </label>
              <input
                type="text"
                value={form.things_to_avoid}
                onChange={(e) => setForm({ ...form, things_to_avoid: e.target.value })}
                placeholder="e.g. competitor mentions, political content"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Creator tiers
              </label>
              <div className="flex flex-wrap gap-2">
                {TIERS.map((tier) => {
                  const selected = form.creator_tier_preferences.includes(tier);
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          creator_tier_preferences: selected
                            ? form.creator_tier_preferences.filter((t) => t !== tier)
                            : [...form.creator_tier_preferences, tier],
                        })
                      }
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selected
                          ? "bg-gray-900 text-white border-gray-900"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shortlist size
              </label>
              <input
                type="number"
                value={form.shortlist_size_target}
                onChange={(e) =>
                  setForm({ ...form, shortlist_size_target: Number(e.target.value) })
                }
                min={3}
                max={30}
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </>
        )}

        {error && (
          <ErrorState
            message="Brief submission failed."
            detail={String(error)}
          />
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Interpreting brief…" : "Interpret brief"}
        </button>
      </form>
    </div>
  );
}
