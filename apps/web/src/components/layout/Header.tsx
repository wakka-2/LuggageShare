'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/how-it-works"
              className="text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 px-4 py-2 rounded-full transition-all"
            >
              كيف يعمل
            </Link>
            <Link
              href="/become-carrier"
              className="text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 px-4 py-2 rounded-full transition-all"
            >
              كن ناقلاً
            </Link>
            <Link
              href="/help"
              className="text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 px-4 py-2 rounded-full transition-all"
            >
              المساعدة
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button className="w-10 h-10 flex items-center justify-center rounded-full text-v2-text-soft hover:text-v2-text hover:bg-v2-primary/5 transition-all">
              <Globe className="w-5 h-5" />
            </button>

            {/* Auth Buttons */}
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

            {/* Mobile Menu Button */}
            <button
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
                href="/how-it-works"
                className="text-v2-text-soft hover:text-v2-text px-4 py-2 rounded-full hover:bg-v2-primary/5 transition-all"
              >
                كيف يعمل
              </Link>
              <Link
                href="/become-carrier"
                className="text-v2-text-soft hover:text-v2-text px-4 py-2 rounded-full hover:bg-v2-primary/5 transition-all"
              >
                كن ناقلاً
              </Link>
              <Link
                href="/help"
                className="text-v2-text-soft hover:text-v2-text px-4 py-2 rounded-full hover:bg-v2-primary/5 transition-all"
              >
                المساعدة
              </Link>
              <hr className="border-v2-primary/10 my-2" />
              <Link
                href="/auth/login"
                className="text-v2-text-soft hover:text-v2-text px-4 py-2 rounded-full hover:bg-v2-primary/5 transition-all"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/auth/register"
                className="v2-gradient-primary text-white px-5 py-2 rounded-full text-center font-semibold"
              >
                إنشاء حساب
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
