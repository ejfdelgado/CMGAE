
var gulp = require('gulp')
, uglify = require("gulp-uglify")
, concat = require("gulp-concat")
, babel = require("gulp-babel");

gulp.task('default', function() {
  gulp.src([
    './assets/cmgae/comun0.js',
  ]).pipe(concat('comun0.min.js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('assets/dist/comun'));
  
  gulp.src([
    './assets/cmgae/comun.js',
  ]).pipe(concat('comun.min.js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('assets/dist/comun'));
  
  gulp.src([
    './assets/cmgae/createmain.js',
  ]).pipe(concat('createmain.min.js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('assets/dist/admin'));
  
  gulp.src([
    './assets/cmgae/editor.js',
  ]).pipe(concat('editor.min.js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('assets/dist/admin'));
});
