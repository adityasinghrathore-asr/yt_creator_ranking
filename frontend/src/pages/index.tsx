/**
 * frontend/src/pages/index.tsx
 * -----------------------------
 * Landing page. Routes to brief entry or real-world validation.
 */

import { useRouter } from "next/router";
import PageHeader from "@/components/shared/PageHeader";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-gray-900 mb-3">
          Creator Partnership Intelligence
        </h1>
        <p className="text-gray-500 mb-10 max-w-xl">
          Submit a campaign brief to find the right YouTube creators — ranked by
          genuine fit, not subscriber count.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push("/brief")}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Start with a campaign brief
          </button>
          <button
            onClick={() => router.push("/validation")}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Validate a specific creator
          </button>
        </div>
      </main>
    </div>
  );
}
