/**
 * React Native CLI configuration.
 * Explicitly declares the Android source directory so the CLI can always find it.
 */
module.exports = {
  project: {
    android: {
      sourceDir: './android',
    },
    ios: {
      sourceDir: './ios',
    },
  },
};
