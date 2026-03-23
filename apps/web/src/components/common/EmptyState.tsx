import Link from 'next/link';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
}

/**
 * Consistent empty state for list pages (no trips, no messages, etc.)
 * Centered vertically in its container, bilingual-ready (caller passes translated strings).
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-v2-primary/10 flex items-center justify-center mx-auto mb-5 shadow-bubble-xs">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-v2-text mb-2">{title}</h3>
      <p className="text-v2-text-soft mb-7 max-w-xs leading-relaxed">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full v2-gradient-primary text-white font-semibold shadow-bubble-sm hover:opacity-90 active:scale-[0.97] transition-all duration-150"
        >
          {action.icon}
          {action.label}
        </Link>
      )}
    </div>
  );
}
