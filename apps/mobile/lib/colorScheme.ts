import { useSyncExternalStore } from 'react';
import { Appearance, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Live app color scheme (System / Light / Dark), switchable without reloading.
 *
 * Module-level styles are wrapped in `themed()` (providers/ThemeProvider), which
 * rebuilds them lazily whenever the scheme changes. Listeners registered here
 * run in insertion order: ThemeProvider registers first (at module load) to swap
 * the V2_COLORS palette in place, then the root layout re-renders the tree.
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

function resolve(pref: ThemePreference): ColorScheme {
  if (pref !== 'system') return pref;
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

/**
 * Tell the native side which mode the app uses, so native dialogs (date picker,
 * alerts) match. null = follow the OS. The Activity declares uiMode in
 * configChanges, so this does not recreate the screen.
 */
function applyNativeOverride(pref: ThemePreference) {
  if (Platform.OS === 'web') return;
  try {
    Appearance.setColorScheme(pref === 'system' ? null : pref);
  } catch {
    // Older runtimes without setColorScheme: native dialogs just follow the OS.
  }
}

let preference: ThemePreference = readPreference();
applyNativeOverride(preference);
let scheme: ColorScheme = resolve(preference);
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getThemePreference(): ThemePreference {
  return preference;
}

export function getColorScheme(): ColorScheme {
  return scheme;
}

export function isDarkScheme(): boolean {
  return scheme === 'dark';
}

export function subscribeColorScheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Persist the preference and apply it immediately (no reload). */
export function setThemePreference(next: ThemePreference): void {
  try {
    if (Platform.OS === 'web') globalThis.localStorage?.setItem(STORAGE_KEY, next);
    else SecureStore.setItem(STORAGE_KEY, next);
  } catch {
    // Storage failure only affects the next launch; still apply now.
  }
  preference = next;
  applyNativeOverride(next);
  scheme = resolve(next);
  notify();
}

// Follow the OS setting live when the preference is "system".
Appearance.addChangeListener(({ colorScheme }) => {
  if (preference !== 'system') return;
  const next: ColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
  if (next === scheme) return;
  scheme = next;
  notify();
});

export function useColorSchemeValue(): ColorScheme {
  return useSyncExternalStore(subscribeColorScheme, getColorScheme);
}

export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribeColorScheme, getThemePreference);
}
