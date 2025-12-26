module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './apps/mobile',
            '@web': './apps/web',
            '@ui': './packages/ui',
          },
        },
      ],
      'expo-router/babel',
    ],
  };
};
