var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var del = require('del');

var config = require('./config.json');

gulp.task('clean', function(){
  gutil.log("Deleting all build files.");
  return del([config.build]);
});


gulp.task('build', function(){
  gulp.src(config.src)
  .pipe(gulp.dest(config.build));
  gulp.src(config.lib)
  .pipe(gulp.dest(config.build + '/lib'));
});

gulp.task('default', ['build']);