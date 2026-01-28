import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      // Default to Arabic for Saudi market, or use device language if Arabic
      const language = deviceLanguage.startsWith('ar') ? 'ar' : 'ar';
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

export const changeLanguage = async (language: 'ar' | 'en') => {
  await i18n.changeLanguage(language);
};

export const getCurrentLanguage = () => i18n.language;

export const isRTL = () => i18n.language === 'ar';
