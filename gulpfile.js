'use strict';

var babel = require('babelify');
var browserify = require('browserify');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var watchify = require('watchify');

gulp.task('default', ['build']);
gulp.task('build', function() { build(false); });
gulp.task('watch', function() { build(true); });
gulp.task('lint', function() { lint(); });

function build(watch) {
    var browserifyOpt = {
        entries: ['./src/index.js'],
        debug: true,
    };
    if (watch) {
        browserifyOpt.cache = {};
        browserifyOpt.packageCache = {};
        browserifyOpt.plugin = [watchify];
    }

    var b = browserify(browserifyOpt);
    if (watch) {
        b = watchify(b);
        b.on('update', function() { compile(b); });
    }
    b = b.transform(babel);

    function printError(msg) {
        console.log(msg);
        this.emit('end');
    }

    function compile(b) {
        return b.bundle().on('error', printError)
            .pipe(source('soar.min.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify()).on('error', printError)
            .pipe(sourcemaps.write("./"))
            .pipe(gulp.dest('./bin'));
    }

    return compile(b);
}

function lint() {
    return gulp.src('./src/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format());
}
