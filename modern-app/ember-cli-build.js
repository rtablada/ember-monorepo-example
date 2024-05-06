'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const sideWatch = require('@embroider/broccoli-side-watch');

module.exports = async function (defaults) {
  const app = new EmberApp(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },

    trees: {
      app: await require('./watch-workspace-addons.cjs').watchLibraries(
        __dirname,
      ),
    },
    // Add options here
  });

  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    staticEmberSource: true,
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
};
