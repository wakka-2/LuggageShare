/**
 * Native Android dialogs (date picker, alerts) follow the app's light/dark choice
 * and use the brand purple instead of the default teal.
 *
 * - AppTheme parent -> DayNight, so AppCompatDelegate night mode (set from JS via
 *   Appearance.setColorScheme) also themes native dialogs.
 * - datePickerDialogTheme / alertDialogTheme with colorAccent = brand primary.
 */
const { withAndroidStyles } = require('@expo/config-plugins');

const BRAND = '#7C6AFF';

function setItem(style, name, value) {
  style.item = style.item || [];
  const existing = style.item.find((i) => i.$.name === name);
  if (existing) existing._ = value;
  else style.item.push({ $: { name }, _: value });
}

function upsertStyle(resources, name, parent, items) {
  resources.style = resources.style || [];
  let style = resources.style.find((s) => s.$.name === name);
  if (!style) {
    style = { $: { name, parent }, item: [] };
    resources.style.push(style);
  }
  style.$.parent = parent;
  for (const [k, v] of Object.entries(items)) setItem(style, k, v);
  return style;
}

module.exports = function withAndroidDialogTheme(config) {
  return withAndroidStyles(config, (cfg) => {
    const resources = cfg.modResults.resources;

    upsertStyle(resources, 'BrandDialogTheme', 'Theme.AppCompat.DayNight.Dialog', {
      colorAccent: BRAND,
      colorPrimary: BRAND,
      'android:colorAccent': BRAND,
    });
    upsertStyle(resources, 'BrandAlertDialogTheme', 'Theme.AppCompat.DayNight.Dialog.Alert', {
      colorAccent: BRAND,
      'android:colorAccent': BRAND,
    });

    const app = resources.style.find((s) => s.$.name === 'AppTheme');
    if (app) {
      app.$.parent = 'Theme.AppCompat.DayNight.NoActionBar';
      // The default light theme forced black text; let DayNight pick it.
      app.item = (app.item || []).filter((i) => i.$.name !== 'android:textColor');
      setItem(app, 'android:datePickerDialogTheme', '@style/BrandDialogTheme');
      setItem(app, 'android:alertDialogTheme', '@style/BrandAlertDialogTheme');
      setItem(app, 'alertDialogTheme', '@style/BrandAlertDialogTheme');
      setItem(app, 'colorAccent', BRAND);
    }
    return cfg;
  });
};
