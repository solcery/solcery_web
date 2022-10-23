const CracoLessPlugin = require("craco-less");
const webpack = require('webpack');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  webpack: {
    plugins: {
      add: [
        new webpack.DefinePlugin({
          process: {env: {}}
        })
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
      module: {
        rules: [
          // {
          //   test: /\.less$/,
          //   use: [
          //     {
          //     loader: "style-loader"
          //     }, 
          //     {
          //       loader: "css-loader"
          //     }, 
          //     {
          //       loader: "less-loader",
          //       options: {
          //         javascriptEnabled: true
          //       }
          //     }
          //   ]
          // }
          // {
          //   test: /\.mjs$/,
          //   include: /node_modules/,
          //   type: "javascript/auto",
          // },
          // {
          //   loader: 'babel-loader',
          //   test: /\.js$/,
          //   exclude: /node_modules/
          // },
          // {
          //   test: /\.less$/i,
          //   use: [
          //     // compiles Less to CSS
          //     "style-loader",
          //     "css-loader",
          //     "less-loader",
          //   ],
          // }
        ]
      }
    },
  },
};
