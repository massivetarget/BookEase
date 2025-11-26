const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['expo-router'],
      },
    },
    argv
  );

  // Add ContextReplacementPlugin to support require.context
  config.plugins.push(
    new webpack.ContextReplacementPlugin(
      /expo-router/, // or more general RegExp if needed
      (data) => {
        // You can customize resourceRegExp or other behavior here if needed
        return data;
      }
    )
  );

  return config;
};
