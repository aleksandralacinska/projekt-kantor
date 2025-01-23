module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'], // Podstawowy preset Expo
      plugins: ['react-native-reanimated/plugin'], // Wymagany dla react-native-reanimated
    };
  };
  