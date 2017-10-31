/* global __dirname, require, module*/

const path = require('path');

const env = require('yargs').argv.env; // use --env with webpack 2
const webpack = require('webpack');

const MODULE_CONFIG = {
  rules: [
    {
      test: /(\.jsx|\.js)$/,
      loader: 'babel-loader',
      exclude: /(node_modules|bower_components)/
    },
    {
      test: /(\.jsx|\.js)$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    }
  ]
};

let PLUGINS = [];
let min = '';

//const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

// if (env === 'build') {
//   PLUGINS.push(new UglifyJsPlugin({ minimize: true }));
//   min = 'min.';
// }

const config = {
    entry: {
      deriver: __dirname + '/src/deriver/index.js',
    },
    output: {
      path: __dirname + '/dist/fxa-crypto-relier',
      filename: `fxa-crypto-deriver.amd.${min}js`,
      library: 'fxaCryptoDeriver',
      libraryTarget: 'amd',
      umdNamedDefine: true
    },
    module: MODULE_CONFIG,
    plugins: PLUGINS
};

module.exports = config;
