
const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

const outdir = path.resolve(__dirname, "./dist");

if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { recursive: true });
}

module.exports = {
  experiments: {
    asyncWebAssembly: true,
  },
  entry: {
    app: "./index.js",
  },
  output: {
    path: outdir,
    filename: "[name].js",
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "index.html" }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "./assets", to: "./assets" } //to the dist root directory
      ]
    }),
    new CompressionPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.wasm$/,
      }
    ],
  },
  optimization: {
    minimize: false
  },
  mode: "production"
};
