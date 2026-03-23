'use client';

/**
 * Next.js App Router template.tsx
 *
 * Unlike layout.tsx (which persists across navigations), template.tsx creates
 * a fresh instance on every route change — which means its CSS classes re-apply
 * on every navigation, giving us per-page entrance animations.
 *
 * The animation is gated to mobile only via the .mobile-page-enter class
 * whose keyframe is wrapped in @media (max-width: 767px) in globals.css.
 * Desktop sees no animation (zero layout shift, zero performance cost).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="mobile-page-enter">{children}</div>;
}
