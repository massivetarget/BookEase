const { getDefaultConfig } = require("expo/metro-config");
const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
    ...defaultConfig,
    transformer: {
        ...defaultConfig.transformer,
    },
    resolver: {
        ...defaultConfig.resolver,
    },
};



/* // Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
 */