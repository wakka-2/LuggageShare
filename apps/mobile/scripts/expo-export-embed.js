#!/usr/bin/env node
// Wrapper for Expo CLI's export:embed that sets the correct project root.
// When called from Gradle in a monorepo, getMetroServerRoot() walks up to the
// workspace root (LuggageShare/) and Metro resolves entry files from there.
// EXPO_NO_METRO_WORKSPACE_ROOT=1 keeps projectRoot as-is (apps/mobile/).

const path = require('path');
const projectRoot = path.resolve(__dirname, '..');  // apps/mobile/

process.env.EXPO_NO_METRO_WORKSPACE_ROOT = '1';
process.chdir(projectRoot);

const { expoExportEmbed } = require('@expo/cli/build/src/export/embed/index.js');

// Gradle calls: node <this-file> export:embed --entry-file index.js --platform ...
// Skip 'export:embed' (index 2), pass the rest directly.
const argv = process.argv.slice(3);
expoExportEmbed(argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
