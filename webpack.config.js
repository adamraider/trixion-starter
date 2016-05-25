'use strict';

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');

const DEVELOPMENT = 'development';
const PRODUCTION = 'production';

const DEBUG = process.env.NODE_ENV !== PRODUCTION;
const ENV = DEBUG ? DEVELOPMENT : PRODUCTION;

/*############## GLOBALS ##############*/

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify(ENV),
  __DEV__: DEBUG
};


/*############## PLUGINS ##############*/

let plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin(GLOBALS),
  new CopyWebpackPlugin([{from: "src/assets"}]),
  // this plugin injects your resources to the index file
  new HTMLWebpackPlugin({
    filename: 'index.html',
    showErrors: DEBUG,
    template: 'src/assets/index.html',
    inject: 'body'
  })
];

if (!DEBUG) {
  plugins.push(new ExtractTextPlugin('css/[name]-[hash].css', {allChunks: false}));
  plugins.push(new webpack.optimize.DedupePlugin());
  plugins.push(new webpack.optimize.UglifyJsPlugin({compressor: {warnings: false}}));
  plugins.push(new webpack.optimize.AggressiveMergingPlugin());
  plugins.push(new webpack.optimize.MinChunkSizePlugin({minChunkSize: 5000}));
}


/*############## LOADERS ##############*/

let scssLoader;
if (DEBUG) {
  scssLoader = 'style!css?localIdentName=[local]-[hash:base64:4]&sourceMap!stylus?sourceMap';
}
else {
  scssLoader = ExtractTextPlugin.extract([
    "css?sourceMap&minimize&localIdentName=[hash:base64:4]",
    "stylus?sourceMap&outputStyle=compressed",
    "postcss"
  ]);
}

const loaders = [
  {
    test: /\.(css|scss|styl)$/,
    loader: scssLoader
  },
  {
    test: /\.font\.js$/,
    loader: "style!css!fontgen"
  },
  {
    test: /\.jsx?$/,
    include: path.join(__dirname, 'src'),
    loader: 'babel!eslint'
  },
  {
    test: /\.(woff|woff2|ttf|eot|font\.svg)$/g,
    loader: "file"
  },
  {
    test: /\.gif$/,
    loader: 'url?limit=10000&mimetype=image/gif'
  },
  {
    test: /\.(jpg|jpeg)$/,
    loader: 'url?limit=10000&mimetype=image/jpg'
  },
  {
    test: /\.png$/,
    loader: 'url?limit=10000&mimetype=image/png'
  },
  {
    test: /\.svg$/,
    loader: 'url?limit=10000&mimetype=image/svg+xml'
  },
  {
    test: /\.json$/,
    loader: 'json'
  }
];


/*############## OPTIONS ##############*/

module.exports = {
  debug: false,
  devtool: DEBUG ? 'eval' : 'none',
  noInfo: true,
  // dev server expects entry property to be an object
  entry: {
    app: './src/entry.js'
  },
  target: 'web',
  output: {
    path: __dirname + '/dist',
    filename: !DEBUG ? 'js/[name]-[hash].js' : 'js/[name]-.js',
    chunkFilename: "js/[name]-[chunkhash].js",
    publicPath: '/'
  },
  plugins: plugins,
  module: {
    loaders: loaders,
    postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ],
    eslint: {
      failOnWarning: !DEBUG
    }
  },
  resolve: {
    alias: {
      // allow using react/preact based components
      preact: 'trixion',
      react: 'trixion',
      'react-dom': 'trixion',
      src: path.resolve('src')
    },
    extensions: ['', '.js', '.scss', '.css']
  }
};
