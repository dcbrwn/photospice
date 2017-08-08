'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    historyApiFallback: {
      index: 'index.html',
    },
  },
  context: __dirname,
  entry: {
    photospice: ['babel-polyfill', './src/photospice.jsx'],
    // sink: ['babel-polyfill', './src/sink.jsx'],
  },
  output: {
    path: path.resolve('./bundles'),
    publicPath: '/bundles/',
    filename: '[name].js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' },
      },
      { test: /\.js$/, loader: 'source-map-loader' },
      { test: /\.yml$/, loader: 'yml-loader' },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              url: false
            },
          },
          { loader: 'sass-loader' }
        ],
      },
    ]
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.yml'],
  },
};
