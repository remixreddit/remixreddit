var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname);
var APP_DIR = path.resolve(__dirname);

var config = {
  entry: [
    './react.js',
    './react-dom.js',
    './jquery.js',
    './underscore-min.js',
    './ReactRouter.js',
    './History.min.js',
    APP_DIR + '/reddit.js.jsx',
  ],
  output: {
    path: BUILD_DIR,
    filename: 'reddit-done.js'
  },
  module : {
    loaders : [
      {
        test : /\.jsx?/,
        include : APP_DIR,
        loader : 'babel'
      }
    ]
  }
};

module.exports = config;
