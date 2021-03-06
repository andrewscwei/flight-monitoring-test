/**
 * @file This is the Webpack config for compiling client assets in both
 *       `development` and `production` environments.
 */

import CopyPlugin from 'copy-webpack-plugin';
import HTMLPlugin from 'html-webpack-plugin';
import path from 'path';
import PrerenderSPAPlugin, { PuppeteerRenderer as Renderer } from 'prerender-spa-plugin';
import { Configuration, DefinePlugin, EnvironmentPlugin, IgnorePlugin, Plugin } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import appConfig from './app.conf';
import { getLocaleDataFromDir, getLocalesFromDir, getLocalizedRoutesFromDir, getTranslationsFromDir } from './utils';

const isDev: boolean = process.env.NODE_ENV === 'development';
const useBundleAnalyzer: boolean = (!isDev && appConfig.build.analyzer);
const cwd: string = path.join(__dirname, '../');
const inputDir: string = path.join(cwd, 'src');
const outputDir: string = path.join(cwd, 'build');
const localesDir: string = path.join(cwd, 'config/locales');
const locales = getLocalesFromDir(localesDir, appConfig.locales[0], appConfig.locales);

const config: Configuration = {
  devtool: isDev ? 'eval-source-map' : (appConfig.build.sourceMap ? 'source-map' : false),
  entry: {
    bundle: path.join(inputDir, 'index.tsx'),
  },
  mode: isDev ? 'development' : 'production',
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.tsx?$/,
      use: 'ts-loader',
    }, {
      test: /\.(jpe?g|png|gif|svg)(\?.*)?$/,
      loaders: [
        `url-loader?limit=8192&name=assets/images/[name]${isDev ? '' : '.[hash:6]'}.[ext]`,
        `image-webpack-loader?${isDev ? 'disable' : ''}`,
      ],
    }, {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      use: `url-loader?limit=8192&name=assets/media/[name]${isDev ? '' : '.[hash:6]'}.[ext]`,
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      use: `url-loader?limit=8192&name=assets/fonts/[name]${isDev ? '' : '.[hash:6]'}.[ext]`,
    }],
  },
  output: {
    filename: isDev ? '[name].js' : '[name].[chunkhash].js',
    path: outputDir,
    publicPath: isDev ? '/' : appConfig.build.publicPath,
    sourceMapFilename: '[file].map',
  },
  performance: {
    hints: isDev ? false : 'warning',
  },
  plugins: [
    new CopyPlugin([{
      from: path.join(inputDir, 'static'),
      ignore: ['.*'],
      to: outputDir,
    }]),
    new EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
    // new HappyPack({
    //   id: 'ts',
    //   threads: 2,
    //   loaders: [{
    //     path: 'ts-loader',
    //     query: { happyPackMode: true },
    //   }],
    // }),
    new DefinePlugin({
      __APP_CONFIG__: JSON.stringify(appConfig),
      __INTL_CONFIG__: JSON.stringify({
        defaultLocale: appConfig.locales[0],
        localeData: getLocaleDataFromDir(localesDir, locales),
        locales,
        dict: getTranslationsFromDir(localesDir, locales),
      }),
      __ROUTES_CONFIG__: JSON.stringify(getLocalizedRoutesFromDir(path.join(inputDir, 'containers'), locales)),
    }),
    new HTMLPlugin({
      appConfig,
      filename: 'index.html',
      inject: true,
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      template: path.join(inputDir, 'templates', 'index.html'),
    }),
    ...isDev ? [] : [
      new IgnorePlugin(/^.*\/config\/.*$/),
    ],
    ...!useBundleAnalyzer ? [] : [
      new BundleAnalyzerPlugin(),
    ],
    ...isDev ? [] : [
      new PrerenderSPAPlugin({
        staticDir: outputDir,
        routes: [
          '/',
          '/404',
        ],
        // Optional minification.
        minify: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          decodeEntities: true,
          keepClosingSlash: true,
          sortAttributes: true,
        },
        renderer: new Renderer({
          renderAfterTime: 100,
          injectProperty: '__PRERENDERING__',
          inject: {},
        }),
      }),
    ],
  ] as Plugin[],
  ...!isDev ? {} : {
    devServer: {
      historyApiFallback: true,
    },
  } as any,
  resolve: {
    alias: {
      '@': inputDir,
      'styled-components': path.resolve(cwd, 'node_modules/styled-components'),
    },
    extensions: ['.js', '.ts', '.tsx'],
  },
  stats: {
    colors: true,
    errorDetails: true,
    modules: true,
    reasons: true,
  },
  target: 'web',
};

export default config;
