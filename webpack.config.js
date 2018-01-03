const CopyWebpackPlugin = require("copy-webpack-plugin");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const path = require("path");
const UnzipsfxPlugin = require("unzipsfx-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");

module.exports = env =>  {

  return {
    entry: "./src/index.js",
    target: "node",
    externals: [nodeExternals()],
    output: {
      path: path.join(__dirname, "build", "twitter", env.MODULE_VERSION),
      filename: "index.js"
    },
    plugins: [
      new CopyWebpackPlugin([
        {from: "./build-temp/node_modules", to: "node_modules"},
        {from: "./build-temp/package.json"}
      ]),
      new MinifyPlugin(),
      new ZipPlugin({
        path: path.join(__dirname, "build"),
        filename: "twitter"
      }),
      new UnzipsfxPlugin({
        outputPath: path.join(__dirname, "build"),
        outputFilename: "twitter"
      })
    ]
  }
};
