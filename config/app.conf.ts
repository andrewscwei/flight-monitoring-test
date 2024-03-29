/**
 * @file Configuration for both client and server environments.
 */

import dotenv from 'dotenv';

dotenv.config();

export default {
  // App version.
  version: `v${require('../package.json').version}+build.${process.env.BUILD_NUMBER || '0'}`,

  // HTML metadata.
  meta: {
    // Title of the app.
    title: 'Flight Monitoring Test',

    // Short description of the app.
    description: 'Quick hack job of a flight monitoring test',

    // App URL.
    url: 'https://monitor.andr.mu',
  },

  // Google Analytics ID (i.e. UA-XXXXXXXX-1)
  ga: 'UA-108117457-4',

  // App client settings.
  settings: {
    'timer': {
      type: 'slider',
      min: 5,
      max: 20,
      default: 15,
    },
    'speed': {
      type: 'slider',
      min: 1,
      max: 10,
      default: 5,
    },
    'aircraft-count': {
      type: 'range',
      min: 3,
      max: 50,
      default: [5, 20],
    },
    'num-questions': {
      type: 'slider',
      min: 5,
      max: 100,
      default: 15,
    },
    'num-choices': {
      type: 'slider',
      min: 2,
      max: 10,
      default: 5,
    },
    'answer-feedback': {
      type: 'select',
      items: ['yes', 'no'],
      default: 'no',
    },
  },

  // Supported locales. First locale is the default locale.
  locales: ['en'],

  // Config options specific to the `build` task.
  build: {
    // Public path of all loaded assets.
    publicPath: process.env.PUBLIC_PATH || '/',

    // Specifies whether JavaScript and CSS source maps should be generated.
    sourceMap: true,
  },
};
