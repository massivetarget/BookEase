const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
    // [Web-only] Enables CSS support in Metro.
    isCSSEnabled: true,
});

config.resolver.blockList = [
    ...(config.resolver.blockList || []),
    /\/electron\/.*/,
    /\/dist-electron\/.*/,
];

module.exports = config;