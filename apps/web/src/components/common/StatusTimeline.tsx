interface StatusTimelineProps {
  currentStatus: string;
}

const steps = [
  { key: 'pending', label: 'معلق' },
  { key: 'accepted', label: 'مقبول' },
  { key: 'picked_up', label: 'تم الاستلام' },
  { key: 'in_transit', label: 'في الطريق' },
  { key: 'delivered', label: 'تم التوصيل' },
];

export default function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStatus);

  return (
    <>
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-center w-full" dir="rtl">
        {steps.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isFuture = i > currentIndex;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              {/* Dot + Label */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      isCompleted
                        ? 'bg-v2-mint'
                        : isCurrent
                          ? 'bg-v2-primary'
                          : 'bg-v2-text-muted/30'
                    }`}
                  />
                  {isCurrent && (
                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-v2-primary animate-ping opacity-40" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isCompleted
                      ? 'text-v2-mint'
                      : isCurrent
                        ? 'text-v2-primary font-bold'
                        : 'text-v2-text-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (not after last) */}
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    i < currentIndex
                      ? 'bg-v2-mint'
                      : isFuture || isCurrent
                        ? 'border-t-2 border-dashed border-v2-text-muted/30 h-0'
                        : 'bg-v2-text-muted/30'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex md:hidden flex-col gap-0" dir="rtl">
        {steps.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={step.key} className="flex items-stretch gap-3">
              {/* Dot + vertical line */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      isCompleted
                        ? 'bg-v2-mint'
                        : isCurrent
                          ? 'bg-v2-primary'
                          : 'bg-v2-text-muted/30'
                    }`}
                  />
                  {isCurrent && (
                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-v2-primary animate-ping opacity-40" />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 w-0.5 min-h-[24px] ${
                      isCompleted
                        ? 'bg-v2-mint'
                        : 'border-r-2 border-dashed border-v2-text-muted/30 w-0'
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-sm pb-4 ${
                  isCompleted
                    ? 'text-v2-mint'
                    : isCurrent
                      ? 'text-v2-primary font-bold'
                      : 'text-v2-text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
