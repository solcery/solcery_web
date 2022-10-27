const CracoLessPlugin = require("craco-less");
const webpack = require('webpack');
// const dotenv = require('dotenv')

module.exports = () => {
  // const env = dotenv.config().parsed;
  // const envKeys = Object.keys(env).reduce((prev, next) => {
  //   prev[`process.env.${next}`] = JSON.stringify(env[next]);
  //   return prev;
  // }, {});

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
      configure: {
        resolve: {
          fallback: {
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
        },
      },
    },
  };
}

