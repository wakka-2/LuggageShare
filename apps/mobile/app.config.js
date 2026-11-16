/**
 * Dynamic additions on top of app.json (Expo merges this with the static config).
 *
 * - Android push (FCM): needs a Firebase `google-services.json`. Provide it either
 *   as apps/mobile/google-services.json (local builds) or as an EAS file
 *   environment variable named GOOGLE_SERVICES_JSON (cloud builds). When absent the
 *   build still works; Android push registration just stays disabled.
 * - Native Google Sign-In client IDs can come from EAS env vars instead of being
 *   hard-coded in app.json.
 */
const fs = require('fs');
const path = require('path');

module.exports = ({ config }) => {
  const googleServicesFile =
    process.env.GOOGLE_SERVICES_JSON ||
    (fs.existsSync(path.join(__dirname, 'google-services.json'))
      ? './google-services.json'
      : undefined);

  const extra = { ...config.extra };
  if (process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) {
    extra.googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  }
  if (process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID) {
    extra.googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  }

  return {
    ...config,
    extra,
    android: {
      ...config.android,
      ...(googleServicesFile ? { googleServicesFile } : {}),
    },
  };
};
