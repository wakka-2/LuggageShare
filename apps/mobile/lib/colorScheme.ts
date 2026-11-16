import { Appearance, DevSettings, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';

/**
 * App color scheme, resolved ONCE at startup.
 *
 * Most styles are built with StyleSheet.create at module load from V2_COLORS, so
 * the palette has to be known before any screen module evaluates. We therefore
 * read the user's preference synchronously here and freeze the scheme for the
 * lifetime of the JS runtime. Changing the preference reloads the JS bundle
 * (instant, no app restart) so every stylesheet is rebuilt with the new palette.
 */

export type ThemePreference = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

const STORAGE_KEY = 'theme_preference';

function readPreference(): ThemePreference {
  try {
    const value =
      Platform.OS === 'web'
        ? globalThis.localStorage?.getItem(STORAGE_KEY)
        : SecureStore.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

export const THEME_PREFERENCE: ThemePreference = readPreference();

export const COLOR_SCHEME: ColorScheme =
  THEME_PREFERENCE === 'system'
    ? Appearance.getColorScheme() === 'dark'
      ? 'dark'
      : 'light'
    : THEME_PREFERENCE;

export const IS_DARK = COLOR_SCHEME === 'dark';

/** Persist the preference and reload the JS bundle so it takes effect everywhere. */
export async function setThemePreference(preference: ThemePreference): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(STORAGE_KEY, preference);
    globalThis.location?.reload();
    return;
  }

  SecureStore.setItem(STORAGE_KEY, preference);

  if (__DEV__) {
    DevSettings.reload();
    return;
  }
  await Updates.reloadAsync();
}
