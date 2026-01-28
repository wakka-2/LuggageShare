'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ح</span>
            </div>
            <span className="font-bold text-xl text-gray-900">حصتي</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/how-it-works"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              كيف يعمل
            </Link>
            <Link
              href="/become-carrier"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              كن ناقلاً
            </Link>
            <Link
              href="/help"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              المساعدة
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Globe className="w-5 h-5" />
            </button>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                إنشاء حساب
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              <Link
                href="/how-it-works"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                كيف يعمل
              </Link>
              <Link
                href="/become-carrier"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                كن ناقلاً
              </Link>
              <Link
                href="/help"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                المساعدة
              </Link>
              <hr className="border-gray-200" />
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-center hover:bg-primary-700 transition-colors"
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
