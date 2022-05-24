const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [
    {
      add: [
        new webpack.DefinePlugin({
          process: {env: {}}
        })
      ],
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
};
