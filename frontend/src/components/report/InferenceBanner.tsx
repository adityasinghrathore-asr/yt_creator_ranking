/**
 * frontend/src/components/report/InferenceBanner.tsx
 * ----------------------------------------------------
 * Inline inference label. NOT a dismissable page banner — embedded at point of consumption.
 * pageLevel=true renders a slightly more prominent version at the top of the report.
 */

interface Props {
  pageLevel?: boolean;
}

export default function InferenceBanner({ pageLevel }: Props) {
  if (pageLevel) {
    return (
      <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-4">
        All signal tiers on this page are inferred from public content — transcripts, comments,
        and channel metadata. None are verified directly with creators. Every chip shows its
        inference source.
      </div>
    );
  }

  return (
    <p className="inference-banner">
      Signal tiers inferred from public content · not verified creator data
    </p>
  );
}
