'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  Globe,
  PlusCircle,
  Plane,
  MessageSquare,
  User,
  Wallet,
  Bell,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, signOut } = useAuth();

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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 v2-gradient-primary rounded-2xl flex items-center justify-center shadow-bubble-xs">
              <span className="text-white font-bold text-lg">ح</span>
            </div>
            <span className="font-extrabold text-xl text-v2-text">حصتي</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/listing/create"
              className="text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 px-4 py-2 rounded-full transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              أضف رحلة
            </Link>
            <Link
              href="/trips"
              className="text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 px-4 py-2 rounded-full transition-all flex items-center gap-1.5"
            >
              <Plane className="w-4 h-4" />
              رحلاتي
            </Link>
            <Link
              href="/messages"
              className="text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 px-4 py-2 rounded-full transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              الرسائل
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              aria-label="تغيير اللغة"
              className="w-10 h-10 flex items-center justify-center rounded-full text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 transition-all"
            >
              <Globe className="w-5 h-5" />
            </button>

            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="hidden md:flex w-10 h-10 items-center justify-center rounded-full text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 transition-all"
                  aria-label="الإشعارات"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* User Dropdown */}
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-v2-primary/5 transition-all"
                  >
                    <UserAvatar user={user} />
                    <span className="text-sm font-medium text-v2-text max-w-[100px] truncate">
                      {user.displayName || 'مستخدم'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-v2-text-muted" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute left-0 rtl:left-auto rtl:right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-bubble-md py-2 z-50">
                      <Link
                        href="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-v2-text hover:bg-v2-primary/5 transition-colors"
                      >
                        <User className="w-4 h-4 text-v2-text-soft" />
                        الملف الشخصي
                      </Link>
                      <Link
                        href="/wallet"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-v2-text hover:bg-v2-primary/5 transition-colors"
                      >
                        <Wallet className="w-4 h-4 text-v2-text-soft" />
                        المحفظة
                      </Link>
                      <Link
                        href="/notifications"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-v2-text hover:bg-v2-primary/5 transition-colors"
                      >
                        <Bell className="w-4 h-4 text-v2-text-soft" />
                        الإشعارات
                      </Link>
                      <hr className="border-v2-primary/10 my-1" />
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-v2-secondary hover:bg-v2-secondary/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-v2-text-soft hover:text-v2-text px-4 py-2 rounded-full border border-v2-primary/20 hover:border-v2-primary/40 transition-all"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/auth/register"
                  className="v2-gradient-primary text-white px-5 py-2 rounded-full font-semibold hover:shadow-bubble-md transition-all"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-v2-text-soft hover:bg-v2-primary/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-v2-primary/10">
            <nav className="flex flex-col gap-2">
              <Link
                href="/listing/create"
                onClick={() => setIsMenuOpen(false)}
                className="text-v2-text-soft hover:text-v2-text px-4 py-2 rounded-full hover:bg-v2-primary/5 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                أضف رحلة
              </Link>
              <Link
                href="/trips"
                onClick={() => setIsMenuOpen(false)}
                className="text-v2-text-soft hover:text-v2-text px-4 py-2 rounded-full hover:bg-v2-primary/5 transition-all flex items-center gap-2"
              >
                <Plane className="w-4 h-4" />
                رحلاتي
              </Link>
              <Link
                href="/messages"
                onClick={() => setIsMenuOpen(false)}
                className="text-v2-text-soft hover:text-v2-text px-4 py-2 rounded-full hover:bg-v2-primary/5 transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                الرسائل
              </Link>
              <hr className="border-v2-primary/10 my-2" />
              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-v2-text-soft hover:text-v2-text px-4 py-2 rounded-full hover:bg-v2-primary/5 transition-all flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    الملف الشخصي
                  </Link>
                  <Link
                    href="/wallet"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-v2-text-soft hover:text-v2-text px-4 py-2 rounded-full hover:bg-v2-primary/5 transition-all flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    المحفظة
                  </Link>
                  <Link
                    href="/notifications"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-v2-text-soft hover:text-v2-text px-4 py-2 rounded-full hover:bg-v2-primary/5 transition-all flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    الإشعارات
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut();
                    }}
                    className="text-v2-secondary px-4 py-2 rounded-full hover:bg-v2-secondary/5 transition-all flex items-center gap-2 text-start"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-v2-text-soft hover:text-v2-text px-4 py-2 rounded-full hover:bg-v2-primary/5 transition-all"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="v2-gradient-primary text-white px-5 py-2 rounded-full text-center font-semibold"
                  >
                    إنشاء حساب
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
