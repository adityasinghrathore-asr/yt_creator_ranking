/**
 * frontend/src/components/validation/ValidationEntryForm.tsx
 * ------------------------------------------------------------
 * Two fields: brand name, creator name. AI researches autonomously.
 */

import { useState } from "react";

interface Props {
  onSubmit: (brandName: string, creatorName: string) => void;
  isLoading: boolean;
}

export default function ValidationEntryForm({ onSubmit, isLoading }: Props) {
  const [brandName, setBrandName] = useState("");
  const [creatorName, setCreatorName] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brand name
        </label>
        <input
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="e.g. Google Pixel"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Creator name or channel handle
        </label>
        <input
          type="text"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          placeholder="e.g. Marques Brownlee or @mkbhd"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>
      <button
        onClick={() => onSubmit(brandName, creatorName)}
        disabled={isLoading || !brandName || !creatorName}
        className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Researching…" : "Research this creator"}
      </button>
    </div>
  );
}
