/**
 * Skeleton shimmer building blocks — use these instead of animate-pulse.
 * All elements use the .skeleton-shimmer CSS class from globals.css which
 * references design system colors via CSS variables.
 */

/** Generic single line — for text placeholders */
export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-full ${className}`} />;
}

/** Circle — for avatars */
export function SkeletonCircle({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-full ${className}`} />;
}

/** Rounded rect — for chips, buttons, badges */
export function SkeletonChip({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-full ${className}`} />;
}

/** Card wrapper — provides card shape, children lay out the skeleton internals */
export function SkeletonCard({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-[22px] p-5 shadow-bubble-sm ${className}`}>{children}</div>
  );
}

/** Pre-built: trip listing card skeleton */
export function TripCardSkeleton() {
  return (
    <SkeletonCard>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <SkeletonLine className="h-6 w-20" />
        <SkeletonLine className="h-4 w-16" />
      </div>

      {/* Route codes + arrow */}
      <div className="flex items-center justify-between mb-1">
        <SkeletonLine className="h-7 w-12 rounded" />
        <div className="flex-1 mx-4">
          <div className="skeleton-shimmer h-0.5 rounded" />
        </div>
        <SkeletonLine className="h-7 w-12 rounded" />
      </div>

      {/* City names */}
      <div className="flex items-center justify-between mb-4">
        <SkeletonLine className="h-3 w-14" />
        <SkeletonLine className="h-3 w-14" />
      </div>

      {/* Meta chips */}
      <div className="flex items-center gap-2 mb-4">
        <SkeletonChip className="h-6 w-16" />
        <SkeletonChip className="h-6 w-14" />
      </div>

      <div className="border-t border-v2-primary/10 my-3" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkeletonCircle className="w-8 h-8" />
          <SkeletonLine className="h-4 w-24" />
        </div>
        <SkeletonLine className="h-6 w-12" />
      </div>
    </SkeletonCard>
  );
}

/** Pre-built: conversation row skeleton (for messages page) */
export function ConversationCardSkeleton() {
  return (
    <div className="flex items-center gap-3 bg-white rounded-[22px] p-4 shadow-bubble-sm">
      <SkeletonCircle className="w-12 h-12 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <SkeletonLine className="h-4 w-28" />
          <SkeletonLine className="h-3 w-14" />
        </div>
        <SkeletonLine className="h-3 w-full" />
      </div>
    </div>
  );
}

/** Pre-built: booking card skeleton (for trips page) */
export function BookingCardSkeleton() {
  return (
    <SkeletonCard>
      <div className="flex items-center justify-between mb-3">
        <SkeletonLine className="h-6 w-20" />
        <SkeletonChip className="h-5 w-16" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <SkeletonLine className="h-8 w-14 rounded" />
        <div className="flex-1 mx-4 skeleton-shimmer h-0.5 rounded" />
        <SkeletonLine className="h-8 w-14 rounded" />
      </div>
      <div className="flex gap-2">
        <SkeletonChip className="h-6 w-16" />
        <SkeletonChip className="h-6 w-20" />
      </div>
    </SkeletonCard>
  );
}

/** Pre-built: profile skeleton */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <SkeletonCircle className="w-24 h-24" />
      <div className="flex flex-col items-center gap-2 w-full max-w-xs">
        <SkeletonLine className="h-6 w-40" />
        <SkeletonLine className="h-4 w-32" />
        <SkeletonLine className="h-4 w-48" />
      </div>
    </div>
  );
}
