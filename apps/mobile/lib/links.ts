import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

/** Public web app base URL (hosts /terms and /privacy). Configured in app.json extra.webUrl. */
export const WEB_URL: string =
  (Constants.expoConfig?.extra?.webUrl as string | undefined) ??
  'https://luggageshare-iota.vercel.app';

/** Opens a public legal page in an in-app browser. Works while signed out. */
export function openLegalPage(page: 'terms' | 'privacy') {
  return WebBrowser.openBrowserAsync(`${WEB_URL}/${page}`);
}
