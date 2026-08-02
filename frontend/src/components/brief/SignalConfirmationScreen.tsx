/**
 * frontend/src/components/brief/SignalConfirmationScreen.tsx
 * ------------------------------------------------------------
 * The most critical UI component in the system.
 * Shows AI-extracted signal chips. Marketer can edit inline, remove, or add.
 * Confirm button is disabled for CONFIRMATION_MIN_DWELL_MS from config.yaml.
 * Ranking does NOT begin until marketer confirms.
 */

import { useState, useEffect } from "react";
import { useConfirmBrief } from "@/hooks/useBrief";
import ErrorState from "@/components/shared/ErrorState";

const MIN_DWELL_MS = Number(
  process.env.NEXT_PUBLIC_CONFIRMATION_MIN_DWELL_MS ?? 3000
);

interface SignalChip {
  id: string;
  label: string;
  category: string;
  source: string;
}

interface Props {
  briefData: Record<string, unknown>;
  onConfirmed: (briefId: string) => void;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  use_case: "Use case",
  audience: "Audience",
  tone: "Tone",
  geography: "Geography",
  avoid: "Avoid",
};

export default function SignalConfirmationScreen({ briefData, onConfirmed, onBack }: Props) {
  const briefId = briefData.brief_id as string;
  const signalSet = briefData.signal_set as Record<string, SignalChip[]>;
  const confirm = useConfirmBrief();

  // Editable local copy of all signal chips
  const [chips, setChips] = useState<Record<string, SignalChip[]>>(() => ({
    primary_use_case_signals: signalSet?.primary_use_case_signals ?? [],
    secondary_category_signals: signalSet?.secondary_category_signals ?? [],
    audience_descriptors: signalSet?.audience_descriptors ?? [],
    geographic_requirements: signalSet?.geographic_requirements ?? [],
    tone_preferences: signalSet?.tone_preferences ?? [],
    avoid_signals: signalSet?.avoid_signals ?? [],
  }));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newChipCategory, setNewChipCategory] = useState("use_case");
  const [newChipLabel, setNewChipLabel] = useState("");
  const [canConfirm, setCanConfirm] = useState(false);

  // Enforce minimum dwell before confirm is enabled
  useEffect(() => {
    const timer = setTimeout(() => setCanConfirm(true), MIN_DWELL_MS);
    return () => clearTimeout(timer);
  }, []);

  function removeChip(group: string, id: string) {
    setChips((prev) => ({
      ...prev,
      [group]: prev[group].filter((c) => c.id !== id),
    }));
  }

  function startEdit(chip: SignalChip) {
    setEditingId(chip.id);
    setEditValue(chip.label);
  }

  function commitEdit(group: string, id: string) {
    setChips((prev) => ({
      ...prev,
      [group]: prev[group].map((c) =>
        c.id === id ? { ...c, label: editValue, source: "marketer_edited" } : c
      ),
    }));
    setEditingId(null);
  }

  function addChip() {
    if (!newChipLabel.trim()) return;
    const categoryToGroup: Record<string, string> = {
      use_case: "primary_use_case_signals",
      audience: "audience_descriptors",
      tone: "tone_preferences",
      geography: "geographic_requirements",
      avoid: "avoid_signals",
    };
    const group = categoryToGroup[newChipCategory] ?? "primary_use_case_signals";
    const newChip: SignalChip = {
      id: `marketer-${Date.now()}`,
      label: newChipLabel.trim(),
      category: newChipCategory,
      source: "marketer_added",
    };
    setChips((prev) => ({ ...prev, [group]: [...prev[group], newChip] }));
    setNewChipLabel("");
  }

  async function handleConfirm() {
    const updatedSignalSet = { brief_id: briefId, ...chips };
    await confirm.mutateAsync({ briefId, signalSet: updatedSignalSet });
    onConfirmed(briefId);
  }

  const allChips = Object.values(chips).flat();

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Review extracted signals
      </h2>
      <p className="text-gray-500 mb-6 max-w-xl">
        These are the signals the system will use to rank creators. Edit or remove
        any that are wrong. Add signals the AI missed. Ranking begins only after
        you confirm.
      </p>

      {Object.entries(chips).map(([group, groupChips]) => {
        if (groupChips.length === 0) return null;
        const groupLabel = CATEGORY_LABELS[groupChips[0]?.category] ?? group;
        return (
          <div key={group} className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {groupLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {groupChips.map((chip) => (
                <div
                  key={chip.id}
                  className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm"
                >
                  {editingId === chip.id ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => commitEdit(group, chip.id)}
                      onKeyDown={(e) => e.key === "Enter" && commitEdit(group, chip.id)}
                      className="outline-none text-sm w-32"
                    />
                  ) : (
                    <span
                      className="cursor-pointer"
                      onClick={() => startEdit(chip)}
                      title="Click to edit"
                    >
                      {chip.label}
                    </span>
                  )}
                  {chip.source === "marketer_added" && (
                    <span className="text-xs text-blue-500 ml-1">+you</span>
                  )}
                  {chip.source === "marketer_edited" && (
                    <span className="text-xs text-amber-500 ml-1">edited</span>
                  )}
                  <button
                    onClick={() => removeChip(group, chip.id)}
                    className="text-gray-300 hover:text-gray-500 ml-1 text-xs"
                    aria-label="Remove signal"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Add new signal */}
      <div className="mt-6 flex gap-2 items-center">
        <select
          value={newChipCategory}
          onChange={(e) => setNewChipCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
        >
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          type="text"
          value={newChipLabel}
          onChange={(e) => setNewChipLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addChip()}
          placeholder="Add a signal the AI missed..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <button
          onClick={addChip}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          Add
        </button>
      </div>

      {confirm.isError && (
        <ErrorState
          message="Failed to confirm signals."
          detail={String(confirm.error)}
        />
      )}

      <div className="mt-8 flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          Back to brief
        </button>
        <button
          onClick={handleConfirm}
          disabled={!canConfirm || confirm.isPending || allChips.length === 0}
          className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
        >
          {confirm.isPending
            ? "Confirming…"
            : !canConfirm
            ? "Review signals…"
            : `Confirm ${allChips.length} signals and rank creators`}
        </button>
      </div>
    </div>
  );
}
