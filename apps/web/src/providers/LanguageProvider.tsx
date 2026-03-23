'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import en from '@/i18n/locales/en.json';
import ar from '@/i18n/locales/ar.json';

type Lang = 'ar' | 'en';
type Translations = typeof en;

const translations: Record<Lang, Translations> = { en, ar };

const LANG_KEY = 'app_lang';

function getStoredLang(): Lang {
  if (typeof window === 'undefined') return 'ar';
  return (localStorage.getItem(LANG_KEY) as Lang) || 'ar';
}

function applyLangToDOM(lang: Lang) {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Resolve a dot-separated key like "home.greeting" from a nested object.
 */
function resolve(obj: Record<string, unknown>, key: string): string {
  const parts = key.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return key;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : key;
}

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'ar',
  toggleLang: () => {},
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');

  useEffect(() => {
    const stored = getStoredLang();
    setLangState(stored);
    applyLangToDOM(stored);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    applyLangToDOM(next);
    localStorage.setItem(LANG_KEY, next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  }, [lang, setLang]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let value = resolve(translations[lang] as unknown as Record<string, unknown>, key);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{{${k}}}`, String(v));
        }
      }
      return value;
    },
    [lang]
  );

  const ctx = useMemo(() => ({ lang, toggleLang, setLang, t }), [lang, toggleLang, setLang, t]);

  return <LanguageContext.Provider value={ctx}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
