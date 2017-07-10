'use strict';

const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
  },
  context: __dirname,
  entry: { main: ['./src/index.jsx'] },
  output: {
    path: path.resolve('./bundles'),
    publicPath: '/bundles/',
    filename: '[name].js'
  },
  devtool: 'source-map',

  plugins: [
    new CopyWebpackPlugin([
      { from: 'assets/**/*' },
    ]),
  ],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'react']
          }
        }
      },
      { test: /\.js$/, loader: 'source-map-loader' },
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
    extensions: ['.js', '.ts', '.tsx']
  },
};
