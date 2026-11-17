const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Keep hierarchical lookup ON: npm nests version-specific deps (e.g. @sentry/browser@8
// needs its own nested @sentry/core@8 while the API hoists @sentry/core@10 to the root).
// Disabling it forced every package onto the hoisted copy and crashed release builds
// at startup ("Super expression must either be null or a function").
config.resolver.disableHierarchicalLookup = false;

// Redirect axios to its React Native-compatible browser build (avoids Node.js crypto/http deps)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'axios') {
    return {
      filePath: require.resolve('axios/dist/browser/axios.cjs'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
