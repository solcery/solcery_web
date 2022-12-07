const CracoLessPlugin = require("craco-less");
const { loaderByName, addBeforeLoader } = require('@craco/craco')
const webpack = require('webpack');

module.exports = () => {
  return {
    plugins: [
      {
        plugin: CracoLessPlugin,
        options: {
          lessLoaderOptions: {
            lessOptions: {
              modifyVars: { "@primary-color": "#2abdd2" },
              javascriptEnabled: true,
            },
          },
        },
      },
    ],
   
    webpack: {
      plugins: {
        add: [
          new webpack.DefinePlugin({ process: {} }),
        ]
      },
      configure: (webpackConfig, { env, paths }) => {
        webpackConfig.resolve.fallback = {
          "dns": false,
          "fs": false,
          "tls": false,
          "net": false,
          "os": require.resolve("os-browserify/browser"),
          "stream": require.resolve("stream-browserify"),
          "path": require.resolve("path-browserify"),
          "crypto": require.resolve("crypto-browserify"),
          "timers": require.resolve("timers-browserify"),
          "zlib": require.resolve("browserify-zlib"),
          "http": require.resolve("stream-http"),
        }
        webpackConfig.module.rules.push({
          test: /\.html$/i,
          loader: 'html-loader',
        })
        return webpackConfig;
      },
    },
  };
}

