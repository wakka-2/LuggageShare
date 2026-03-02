import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Platform } from 'react-native';

import ar from './locales/ar.json';
import en from './locales/en.json';

const LANGUAGE_KEY = 'user_language';

// Get device language
const deviceLanguage = getLocales()[0]?.languageCode || 'ar';

// Language detector
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      // Default to Arabic for Saudi market, English for others
      const language = deviceLanguage.startsWith('ar') ? 'ar' : 'en';
      callback(language);
    } catch (error) {
      callback('ar');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lng);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    fallbackLng: 'ar',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

/**
 * On web, I18nManager.forceRTL() does NOT set the HTML `dir` attribute.
 * We must update the DOM manually so CSS logical properties and browser
 * RTL features work correctly.
 */
function applyWebDirection(language: string) {
  if (Platform.OS !== 'web') return;
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
}

export const changeLanguage = async (language: 'ar' | 'en') => {
  const shouldBeRTL = language === 'ar';
  await i18n.changeLanguage(language);
  applyWebDirection(language);

  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
    if (Platform.OS !== 'web') {
      // On native, forceRTL requires a restart.
      // Caller (e.g. HomeHeader) handles the reload on native
    }
  }
};

/**
 * Synchronize I18nManager.isRTL and the web DOM dir attribute with the
 * current language. Call once after i18n initialises (e.g. in the root layout).
 */
export const syncRTL = () => {
  const shouldBeRTL = i18n.language === 'ar';
  applyWebDirection(i18n.language);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
  }
};

export const getCurrentLanguage = () => i18n.language;

export const isRTL = () => i18n.language === 'ar';
