export default function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-[22px] p-5 shadow-bubble-sm animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-20 bg-v2-primary/10 rounded-full" />
        <div className="h-4 w-16 bg-v2-primary/10 rounded-full" />
      </div>

      {/* Route codes */}
      <div className="flex items-center justify-between mb-1">
        <div className="h-7 w-12 bg-v2-primary/10 rounded" />
        <div className="flex-1 mx-4">
          <div className="h-0.5 bg-v2-primary/10 rounded" />
        </div>
        <div className="h-7 w-12 bg-v2-primary/10 rounded" />
      </div>

      {/* City names */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-14 bg-v2-primary/10 rounded" />
        <div className="h-3 w-14 bg-v2-primary/10 rounded" />
      </div>

      {/* Meta chips */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-16 bg-v2-primary/10 rounded-full" />
        <div className="h-6 w-14 bg-v2-primary/10 rounded-full" />
      </div>

      {/* Divider */}
      <div className="border-t border-v2-primary/10 my-3" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-v2-primary/10" />
          <div className="h-4 w-24 bg-v2-primary/10 rounded" />
        </div>
        <div className="h-6 w-12 bg-v2-primary/10 rounded" />
      </div>
    </div>
  );
}
