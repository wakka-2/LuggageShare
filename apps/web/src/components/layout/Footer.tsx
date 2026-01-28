import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">ح</span>
              </div>
              <span className="font-bold text-xl text-white">حصتي</span>
            </Link>
            <p className="text-sm text-gray-400">
              منصة لمشاركة مساحة الأمتعة بين المسافرين
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">الشركة</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm hover:text-white transition-colors">
                  كيف يعمل
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm hover:text-white transition-colors">
                  الوظائف
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">الدعم</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm hover:text-white transition-colors">
                  مركز المساعدة
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-sm hover:text-white transition-colors">
                  السلامة
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">القانونية</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm hover:text-white transition-colors">
                  شروط الخدمة
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/prohibited-items" className="text-sm hover:text-white transition-colors">
                  العناصر المحظورة
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2026 حصتي - LuggageShare. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            <a
              href="https://twitter.com/luggageshare"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://instagram.com/luggageshare"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
