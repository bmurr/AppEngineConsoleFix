var path = require('path');
var del = require('del');

var gulp = require('gulp');
var gutil = require('gulp-util');
var gdebug = require('gulp-debug');

var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var WebpackDevServer = require('webpack-dev-server');

var gulpConfig = require('./gulp.config.js');

function clean() {
  gutil.log('Deleting all generated files.');
  return del([
    gulpConfig.buildDirectory,
    path.join(gulpConfig.vendorDirectory, 'vendor-manifest.json'),
  ]);
}

function build() {
  var promises = [
    //Use Webpack to bundle up our non-vendor JS and styles and output it.
    new Promise(function(resolve, reject) {
      var webpackConfig = require('./webpack.config.js');
      var config = Object.create(webpackConfig);
      webpackStream(config, webpack)
        .pipe(gulp.dest(gulpConfig.buildDirectory))
        .on('end', resolve);
    }),

    new Promise(function(resolve, reject) {
      gulp
        .src(path.join(gulpConfig.srcDirectory, '*.html'))
        .pipe(gulp.dest(gulpConfig.buildDirectory))
        .on('end', resolve);
    }),

    new Promise(function(resolve, reject) {
      gulp
        .src(path.join(gulpConfig.srcDirectory, 'manifest.json'))
        .pipe(gulp.dest(gulpConfig.buildDirectory))
        .on('end', resolve);
    }),
  ];

  //Wait for everything to be done
  return Promise.all(promises);
}

function buildVendor() {
  //All our vendor files are required in a file called vendor.js
  //This task will bundle up the modules in that and make a stub file for our actual js to load modules from.
  //This saves us from building these modules every time we build.

  var vendorConfig = {
    entry: {
      vendor: ['vendor.js'],
    },
    output: {
      // The output bundle file, also called vendor.js
      path: path.join(__dirname, gulpConfig.buildDirectory, 'script'),
      publicPath: 'chrome-extension://lickplgkkppdanbcigejmkconmpcmien/script/',
      filename: '[name].js',
      library: '[name]',
    },
    module: {
      loaders: [
        {
          test: /\.css$/,
          exclude: [path.join(__dirname, gulpConfig.srcDirectory)],
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
          exclude: [path.join(__dirname, gulpConfig.srcDirectory)],
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: 'fonts/',
                publicPath:
                  'chrome-extension://lickplgkkppdanbcigejmkconmpcmien/script/',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DllPlugin({
        // The manifest we will use to reference the libraries
        path: path.join(
          __dirname,
          gulpConfig.vendorDirectory,
          '[name]-manifest.json'
        ),
        name: '[name]',
        context: path.join(__dirname, gulpConfig.vendorDirectory),
      }),
    ],
    resolve: {
      // Tell webpack where to look for our initial vendor.js file
      modules: [
        path.join(__dirname, gulpConfig.vendorDirectory),
        'node_modules',
      ],
    },
  };

  var bundleJS = new Promise(function(resolve, reject) {
    webpack(vendorConfig, function(err, stats) {
      if (err) throw new gutil.PluginError('webpack', err);
      gutil.log(
        '[webpack]',
        stats.toString({
          colors: gutil.colors.supportsColor,
        })
      );
      resolve();
    });

    //   webpackStream(Object.create(vendorConfig), webpack, {verbose: true})
    //     .pipe(gdebug({}))
    //     .pipe(gulp.dest(gulpConfig.buildDirectory))
    //     .on('end', resolve);
  });
  return bundleJS;
}

function watch() {
  gulp.watch('src/**/*.(js|html|scss|json)', { delay: 500 }, build);
}

gulp.task('watch', watch);
gulp.task('build:vendor', buildVendor);
gulp.task('build', build);
gulp.task('clean', clean);
gulp.task('default', gulp.series('clean', 'build'));
