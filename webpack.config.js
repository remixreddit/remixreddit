var webpack = require('webpack');
var path = require('path');

var APP_DIR = path.resolve(__dirname, 'src');
var BUILD_DIR = path.resolve(__dirname, 'out');

var config = {
  entry: [
    APP_DIR + '/reddit.js.jsx',
  ],
  output: {
    path: BUILD_DIR,
    filename: 'reddit.js'
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
