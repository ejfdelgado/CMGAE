
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
	'./assets/cmgae/utils.js',
    './assets/cmgae/moduloActividad.js',
    './assets/cmgae/moduloHttp.js',
    './assets/cmgae/moduloLocal.js',
    './assets/cmgae/moduloApp.js',
    './assets/cmgae/moduloMenus.js',
    './assets/cmgae/moduloEdicion.js',
    './assets/cmgae/comun.js',
  ]).pipe(concat('comun.min.js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('assets/dist/comun'));
  
  gulp.src([
	'./assets/cmgae/utils.js',
    './assets/cmgae/moduloActividad.js',
    './assets/cmgae/moduloHttp.js',
    './assets/cmgae/moduloLocal.js',
	'./assets/cmgae/moduloApp.js',
	'./assets/cmgae/moduloArchivos.js',
	'./assets/cmgae/moduloMenus.js',
	'./assets/cmgae/moduloEdicion.js',
    './assets/cmgae/createmain.js',
  ]).pipe(concat('createmain.min.js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('assets/dist/admin'));
  
  gulp.src([
	'./assets/cmgae/utils.js',
    './assets/cmgae/moduloActividad.js',
    './assets/cmgae/moduloHttp.js',
    './assets/cmgae/moduloLocal.js',
	'./assets/cmgae/moduloMenus.js',
	'./assets/cmgae/moduloApp.js',
	'./assets/cmgae/moduloArchivos.js',
	'./assets/cmgae/moduloEditorTexto.js',
	'./assets/cmgae/moduloArbolArchivos.js',
	'./assets/cmgae/moduloEdicion.js',
    './assets/cmgae/editor.js',
  ]).pipe(concat('editor.min.js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('assets/dist/admin'));
});
