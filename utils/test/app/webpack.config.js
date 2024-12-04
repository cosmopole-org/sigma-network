
const path = require("path");
const fs = require("fs");

const outdir = path.resolve(__dirname, "./dist");

if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { recursive: true });
}

module.exports = {
  experiments: {
    asyncWebAssembly: true,
  },
  entry: {
    app: "./src/index.jsx",
  },
  output: {
    path: outdir,
    filename: "build.js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' }
      }
    ]
  },
  optimization: {
    minimize: false
 },
  mode: "production"
};
