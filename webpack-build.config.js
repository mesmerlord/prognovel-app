const path = require("path");
const webpack = require("webpack");
const AssetsPlugin = require("assets-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
const CSSPlugin = require("./plugins/build/themes/css-global");
const BuildStart = require("./plugins/build/_start");
const OptimizePlugin = require("optimize-plugin");

const mode = process.env.NODE_ENV;
const dev = mode === "development";

const siteMetadata = require("./.cache/assets/publish/sitemetadata.json");

// ENV below are shared both in Client and Server (build pipeline)
const SHARED_ENV = {
  "process.env.SITE_TITLE": JSON.stringify(siteMetadata.site_title),
  "process.env.IMAGE_RESIZER_SERVICE": JSON.stringify(siteMetadata.image_resizer_service),
};

const alias = {
  components: path.resolve(__dirname, "src/components/"),
  home: path.resolve(__dirname, "src/components/home-page/"),
  plugins: path.resolve(__dirname, "plugins/"),
  utils: path.resolve(__dirname, "src/utils/"),
  routes: path.resolve(__dirname, "src/routes/"),
  src: path.resolve(__dirname, "src/"),
  cache: path.resolve(__dirname, ".cache/"),
  scss: path.resolve(__dirname, "style/scss/"),
  style: path.resolve(__dirname, "style/"),
  interledger: path.resolve(__dirname, "interledger/"),
  prognovel: path.resolve(__dirname, "src/node_modules/prognovel"),
  // page routes
  read: path.resolve(__dirname, "src/routes/read/"),
  novel: path.resolve(__dirname, "src/routes/novel/"),
  store: path.resolve(__dirname, "src/store/"),
  typings: path.resolve(__dirname, "typings/"),
  // main files js
  states$: path.resolve(__dirname, "src/store/states.ts"),
  settings$: path.resolve(__dirname, "src/_setting.ts"),
  init$: path.resolve(__dirname, "src/_app-init.ts"),
  monetization$: path.resolve(__dirname, "src/_web-monetization.ts"),
};

function getClientPlugins() {
  const prod = [];
  if (!dev) {
    prod.push(
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        reportFilename: path.resolve(__dirname, ".cache/bundle-analyzer.html"),
        openAnalyzer: false,
      }),
    );
  }
  return [
    // new BuildStart(),
    ...prod,

    new CSSPlugin(),
    // pending https://github.com/sveltejs/svelte/issues/2377
    // dev && new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      "process.browser": true,
      "process.env.BASEPATH": JSON.stringify(path.resolve(__dirname)),
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.WEB_MONETIZATION_VERIFY": JSON.stringify(process.env.WEB_MONETIZATION_VERIFY),
      "process.env.BACKEND_API": JSON.stringify(process.env.BACKEND_API),
      ...SHARED_ENV,
    }),
    // new AssetsPlugin({ filename: ".cache/assets.json" }),

    new DuplicatePackageCheckerPlugin(),
    // new OptimizePlugin({
    //   concurrency: true,
    //   minify: true,
    //   downlevel: false,
    // }),
  ];
}

function getServerPlugins() {
  const prod = [];
  if (!dev) {
    // prod.push(
    //   new HardSourceWebpackPlugin({
    //     cacheDirectory: path.resolve(__dirname, ".cache/build-cache/server/[confighash]"),
    //   }),
    // );
  }

  return [
    ...prod,
    new webpack.DefinePlugin({
      "process.env.BACKEND_API": JSON.stringify(process.env.BACKEND_API),
      "process.env.BASEPATH": JSON.stringify(path.resolve(__dirname)),
      "process.env.PREFETCH_CHAPTER": JSON.stringify(process.env.PREFETCH_CHAPTER),
      "process.env.CACHE_FOLDER": JSON.stringify(path.resolve(__dirname, "./.cache")),
      "process.env.PUBLISH_FOLDER": JSON.stringify(path.resolve(__dirname, "./static/publish")),
    }),
  ];
}

function getServiceWorkerPlugins() {
  const prod = [];
  if (!dev) {
    // prod.push(
    //   new HardSourceWebpackPlugin({
    //     cacheDirectory: path.resolve(__dirname, ".cache/build-cache/service-worker/[confighash]"),
    //   }),
    // );
  }

  return [
    ...prod,
    new webpack.DefinePlugin({
      NOVEL_LIST: JSON.stringify(require("./.cache/assets/publish/sitemetadata.json").novels),
    }),
  ];
}

const swc = {
  test: /\.m?(js|ts)$/,
  exclude: /(node_modules|bower_components)/,
  use: {
    loader: "swc-loader",
  },
};

const swc_prod = {
  test: /\.m?(js|ts)$/,
  exclude: /(node_modules|bower_components)/,
  use: {
    loader: "swc-loader",
  },
};

module.exports = {
  getClientPlugins,
  getServerPlugins,
  getServiceWorkerPlugins,
  // ES Modules import aliases
  // UPDATE tsconfig.json paths after making alias changes
  alias,
  extensions: [".mjs", ".svx", ".js", ".ts", ".d.ts", ".json", ".svelte", ".html"],
  mainFields: ["svelte", "module", "browser", "main"],

  swc,
  swc_prod,
  babel: {
    test: /\.m?(js|ts)$/,
    exclude: /(node_modules|bower_components)/,
    use: {
      loader: "babel-loader",
    },
  },
};
