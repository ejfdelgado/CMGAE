
var gulp = require('gulp')
, uglify = require("gulp-uglify")
, concat = require("gulp-concat")
, babel = require("gulp-babel");

gulp.task('default', function() {
  gulp.src([
    './assets/js/comun/comun0.js',
  ]).pipe(concat('comun0.js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('assets/dist/comun'));
  
  gulp.src([
    './assets/js/comun/comun.js',
  ]).pipe(concat('comun.js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('assets/dist/comun'));
  
  gulp.src([
    './assets/js/create2/createmain.js',
  ]).pipe(concat('createmain.js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('assets/dist/admin'));
});
