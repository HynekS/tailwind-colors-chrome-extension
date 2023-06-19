const CopyPlugin = require("copy-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    popup: "./src/popup.tsx",
    background: "./src/background.ts",
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist",
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/env",
              [
                "@babel/preset-typescript",
                {
                  jsxPragma: "h",
                },
              ],
            ],
            plugins: [
              [
                "@babel/transform-react-jsx",
                {
                  runtime: "automatic",
                  importSource: "preact",
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: __dirname + "/manifest.json",
          to: __dirname + "/dist/manifest.json",
        },
        {
          from: __dirname + "/src/popup.html",
          to: __dirname + "/dist/popup.html",
        },
        {
          from: __dirname + "/src/icons",
          to: __dirname + "/dist",
        },
      ],
    }),
    new ZipPlugin({
      filename: `tw-colors-${+new Date()}`,
      exclude: [/\.map$/],
    }),
  ],
  devtool: "source-map",
  watch: true,
};
