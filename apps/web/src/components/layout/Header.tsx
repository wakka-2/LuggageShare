'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Globe,
  PlusCircle,
  Plane,
  Inbox,
  MessageSquare,
  User,
  Wallet,
  Bell,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useUnreadCount } from '@/hooks/useNotifications';
import { useUnreadMessagesCount } from '@/hooks/useMessages';

// Route prefix → translation key for mobile page titles
const PAGE_TITLES: Record<string, string> = {
  '/trips': 'nav.myTrips',
  '/reservations': 'nav.reservations',
  '/messages': 'nav.messages',
  '/notifications': 'nav.notifications',
  '/profile': 'nav.profile',
  '/wallet': 'nav.wallet',
  '/listing/create': 'nav.addTrip',
  '/listing': 'nav.listing',
  '/booking': 'nav.booking',
  '/chat': 'nav.messages',
  '/auth': 'nav.appName',
};

function getMobileTitleKey(pathname: string): string | null {
  if (pathname === '/') return null; // show logo on home
  const match = Object.keys(PAGE_TITLES).find((prefix) => pathname.startsWith(prefix));
  return match ? PAGE_TITLES[match] : null;
}

function UserAvatar({
  user,
  size = 'sm',
}: {
  user: { displayName: string | null; avatarUrl: string | null };
  size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base';
  const initial = (user.displayName || 'U').charAt(0).toUpperCase();

  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt="" className={`${dim} rounded-full object-cover`} />;
  }

  return (
    <div
      className={`${dim} rounded-full bg-v2-primary/10 flex items-center justify-center font-bold text-v2-primary`}
    >
      {initial}
    </div>
  );
}

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const unreadCount = useUnreadCount();
  const unreadMessages = useUnreadMessagesCount();

  const mobileTitleKey = getMobileTitleKey(pathname);
  const isHomePage = pathname === '/';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-bubble-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-16">
          {/* =============================================
              MOBILE HEADER  (hidden on md+)
              ============================================= */}
          <div className="md:hidden flex items-center justify-between w-full">
            {/* Left: Logo on home, Back chevron + page title elsewhere */}
            {isHomePage ? (
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 v2-gradient-primary rounded-2xl flex items-center justify-center shadow-bubble-xs">
                  <span className="text-white font-bold text-lg">ح</span>
                </div>
                <span className="font-extrabold text-xl text-v2-text">{t('nav.appName')}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0">
                <button
                  type="button"
                  onClick={() => router.back()}
                  aria-label={t('nav.back')}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-v2-text-soft hover:bg-v2-primary/5 transition-all shrink-0"
                >
                  {lang === 'ar' ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>
                <span className="font-semibold text-base text-v2-text truncate">
                  {mobileTitleKey ? t(mobileTitleKey) : t('nav.appName')}
                </span>
              </div>
            )}

            {/* Right: Language toggle + Notification bell (authenticated) */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={toggleLang}
                aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-semibold">{t('nav.switchLang')}</span>
              </button>

              {isAuthenticated && (
                <Link
                  href="/notifications"
                  aria-label={t('nav.notifications')}
                  className="relative w-9 h-9 flex items-center justify-center rounded-full text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 end-0.5 min-w-[16px] h-4 flex items-center justify-center bg-v2-secondary text-white text-[9px] font-bold rounded-full px-0.5">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* =============================================
              DESKTOP HEADER  (hidden on mobile)
              ============================================= */}

          {/* Logo */}
          <Link href="/" className="hidden md:flex items-center gap-2">
            <div className="w-9 h-9 v2-gradient-primary rounded-2xl flex items-center justify-center shadow-bubble-xs">
              <span className="text-white font-bold text-lg">ح</span>
            </div>
            <span className="font-extrabold text-xl text-v2-text">{t('nav.appName')}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <Link
              href="/listing/create"
              className="text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 px-4 py-2 rounded-full transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              {t('nav.addTrip')}
            </Link>
            <Link
              href="/trips"
              className="text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 px-4 py-2 rounded-full transition-all flex items-center gap-1.5"
            >
              <Plane className="w-4 h-4" />
              {t('nav.myTrips')}
            </Link>
            <Link
              href="/reservations"
              className="text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 px-4 py-2 rounded-full transition-all flex items-center gap-1.5"
            >
              <Inbox className="w-4 h-4" />
              {t('nav.reservations')}
            </Link>
            <Link
              href="/messages"
              className="text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 px-4 py-2 rounded-full transition-all flex items-center gap-1.5 relative"
            >
              <MessageSquare className="w-4 h-4" />
              {t('nav.messages')}
              {unreadMessages > 0 && (
                <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-v2-secondary text-white text-[10px] font-bold rounded-full px-1">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </Link>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3 ms-auto">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={toggleLang}
              aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 transition-all"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-semibold">{t('nav.switchLang')}</span>
            </button>

            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="w-10 h-10 flex items-center justify-center rounded-full text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 transition-all relative"
                  aria-label={t('nav.notifications')}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 end-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-v2-secondary text-white text-[10px] font-bold rounded-full px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-v2-primary/5 transition-all"
                  >
                    <UserAvatar user={user} />
                    <span className="text-sm font-medium text-v2-text max-w-[100px] truncate">
                      {user.displayName || t('nav.user')}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-v2-text-muted" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute start-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-bubble-md py-2 z-50">
                      <Link
                        href="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-v2-text hover:bg-v2-primary/5 transition-colors"
                      >
                        <User className="w-4 h-4 text-v2-text-soft" />
                        {t('nav.profile')}
                      </Link>
                      <Link
                        href="/wallet"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-v2-text hover:bg-v2-primary/5 transition-colors"
                      >
                        <Wallet className="w-4 h-4 text-v2-text-soft" />
                        {t('nav.wallet')}
                      </Link>
                      <Link
                        href="/notifications"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-v2-text hover:bg-v2-primary/5 transition-colors"
                      >
                        <Bell className="w-4 h-4 text-v2-text-soft" />
                        {t('nav.notifications')}
                      </Link>
                      <hr className="border-v2-primary/10 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-v2-secondary hover:bg-v2-secondary/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.signOut')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-v2-text-soft hover:text-v2-text px-4 py-2 rounded-full border border-v2-primary/20 hover:border-v2-primary/40 transition-all"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  href="/auth/register"
                  className="v2-gradient-primary text-white px-5 py-2 rounded-full font-semibold hover:shadow-bubble-md transition-all"
                >
                  {t('nav.createAccount')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
