'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plane, MessageSquare, User } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import { useUnreadMessagesCount } from '@/hooks/useMessages';
import { useUnreadCount } from '@/hooks/useNotifications';

type Tab = {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  badge?: number;
};

export function BottomTabBar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const unreadMessages = useUnreadMessagesCount();
  const unreadNotifications = useUnreadCount();

  // Hide on auth pages
  if (pathname.startsWith('/auth/')) return null;

  const tabs: Tab[] = [
    {
      href: '/',
      labelKey: 'nav.home',
      icon: <Home className="w-6 h-6" strokeWidth={1.8} />,
      activeIcon: <Home className="w-6 h-6" strokeWidth={2.5} />,
    },
    {
      href: '/trips',
      labelKey: 'nav.myTrips',
      icon: <Plane className="w-6 h-6" strokeWidth={1.8} />,
      activeIcon: <Plane className="w-6 h-6" strokeWidth={2.5} />,
    },
    {
      href: '/messages',
      labelKey: 'nav.messages',
      icon: <MessageSquare className="w-6 h-6" strokeWidth={1.8} />,
      activeIcon: <MessageSquare className="w-6 h-6" strokeWidth={2.5} />,
      badge: unreadMessages,
    },
    {
      href: '/profile',
      labelKey: 'nav.profile',
      icon: <User className="w-6 h-6" strokeWidth={1.8} />,
      activeIcon: <User className="w-6 h-6" strokeWidth={2.5} />,
      badge: unreadNotifications,
    },
  ];

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 start-0 end-0 z-50 bg-white/95 backdrop-blur-sm border-t border-v2-primary/10 safe-area-bottom"
      aria-label="Bottom navigation"
    >
      <div className="flex items-stretch h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? 'text-v2-primary' : 'text-v2-text-muted hover:text-v2-text-soft'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator pill */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-v2-primary rounded-full" />
              )}

              {/* Icon with badge */}
              <span className="relative">
                {active ? tab.activeIcon : tab.icon}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -end-1 min-w-[16px] h-4 flex items-center justify-center bg-v2-secondary text-white text-[9px] font-bold rounded-full px-0.5">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                ) : null}
              </span>

              {/* Label */}
              <span
                className={`text-[10px] font-medium leading-none ${active ? 'font-semibold' : ''}`}
              >
                {t(tab.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
