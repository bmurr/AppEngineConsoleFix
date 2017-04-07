var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var gulpConfig = require('./gulp.config.js');

module.exports = {
  cache: true,
  
  entry: {
    'content-script': 'script/content-script.js',
    'event-page': 'script/event-page.js',
    main: 'script/main.js'
  },
  output: {
    filename: 'script/[name].js'    
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        include: [ path.join(__dirname, gulpConfig.srcDirectory) ],
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-2', 'react']
        }
      },
      {
        test: /\.scss$/,
        include: [ path.join(__dirname, gulpConfig.srcDirectory) ],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          //resolve-url-loader may be chained before sass-loader if necessary
          use: ['css-loader', 'sass-loader']
        })
        // loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader')
      }
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },


  plugins: [
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'main',
    //   filename: 'script/[name].js',
    //   minChunks: Infinity
    // }),
    new ExtractTextPlugin({
      filename: 'styles/style.css'
    }),
    new webpack.DllReferencePlugin({      
      context: path.join(__dirname, gulpConfig.srcDirectory),    
      manifest: require(path.join(__dirname, gulpConfig.vendorDirectory, 'vendor-manifest.json'))      
    })
  ]
};
