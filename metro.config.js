const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow PDF files to be bundled as static assets via require()
config.resolver.assetExts.push('pdf');

module.exports = config;
