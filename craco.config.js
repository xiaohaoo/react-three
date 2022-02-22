const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
const CracoLessPlugin = require("craco-less");

module.exports = {
  eslint: {
    enable: false
  },
  webpack: {
    plugins: [
      new SimpleProgressWebpackPlugin()
    ],
    configure: (webpackConfig, { env }) => {
      webpackConfig.output.publicPath = "";
      return webpackConfig;
    }
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        miniCssExtractPluginOptions: {
          publicPath: "../../",
        },
      },
    },
  ],
};
