const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * Exclude large generated data files from bundle
 * These files are only used for database seeding on first run
 */
config.resolver.blacklistRE = [
  // Exclude quranData.generated.ts from bundle
  // It will be loaded dynamically only for seeding
  new RegExp('quranData\\.generated\\.ts$'),
];

/**
 * Optimize asset handling
 */
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'db', // Include .db files as assets
];

/**
 * Improve performance
 */
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer.minifierConfig,
    // Keep console.log in dev, remove in prod
    drop_console: process.env.NODE_ENV === 'production',
  },
};

module.exports = config;
