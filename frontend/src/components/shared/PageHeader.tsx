/**
 * frontend/src/components/shared/PageHeader.tsx
 * -----------------------------------------------
 * Minimal header across all pages. Product name + nav to two experiences.
 */

import Link from "next/link";

export default function PageHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-gray-900">
          {process.env.NEXT_PUBLIC_APP_NAME ?? "CPI"}
        </Link>
        <nav className="flex gap-4 text-sm text-gray-500">
          <Link href="/brief" className="hover:text-gray-900 transition-colors">
            Campaign brief
          </Link>
          <Link href="/validation" className="hover:text-gray-900 transition-colors">
            Validate creator
          </Link>
        </nav>
      </div>
    </header>
  );
}
