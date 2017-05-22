/*jshint globalstrict: true*/
/*global require*/

'use strict'

const gulp = require('gulp')
const typescript = require('gulp-typescript')
const connect = require('gulp-connect')
const jdists = require('gulp-jdists')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const open = require('gulp-open')
const examplejs = require('gulp-examplejs')

const port = 20173

gulp.task('connect', function () {
  connect.server({
    port: port,
    livereload: true
  })
})

gulp.task('watch', function () {
  gulp.watch(['./example/*.html', './src/ts/*.ts'], ['build', 'jdists', 'reload'])
})

gulp.task('reload', function () {
  gulp.src(['./example/*.html', './src/ts/*.ts'])
    .pipe(connect.reload())
})

gulp.task('build', function (done) {
  gulp.src('./src/ts/*.ts')
    .pipe(typescript({
      target: 'ES5'
    }))
    .pipe(gulp.dest('./src/js'))
    .on('end', done);
})

gulp.task('jdists', ['build'], function () {
  gulp.src('./src/jchecks.jdists.js')
    .pipe(jdists())
    .pipe(rename('jchecks.js'))
    .pipe(gulp.dest('./'))
})

gulp.task('open', function () {
  gulp.src(__filename)
    .pipe(open({ uri: `http://localhost:${port}/example/index.html` }))
})

gulp.task('uglify', function () {
  gulp.src('jchecks.js')
    .pipe(uglify())
    .pipe(rename('jchecks.min.js'))
    .pipe(gulp.dest('./'))
})

gulp.task('example', function() {
  return gulp.src([
      'src/ts/*.ts'
    ])
    .pipe(examplejs({
      header: `
global.jchecks = require('../jchecks.js');
      `,
      globals: 'document,NodeFilter',
      timeout: 300000,
    }))
    .pipe(rename({
      extname: '.js'
    }))
    .pipe(gulp.dest('test'))
})

gulp.task('dist', ['jdists', 'uglify'])
gulp.task('debug', ['jdists', 'connect', 'watch', 'open'])