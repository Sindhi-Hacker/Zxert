const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
// expo-sqlite's web worker imports a .wasm asset — register the extension so
// Metro resolves it instead of failing the web bundle.
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './global.css' });
