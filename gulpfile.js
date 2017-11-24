
var gulp = require('gulp')
, uglify = require("gulp-uglify")
, concat = require("gulp-concat")
, babel = require("gulp-babel");

gulp.task('default', function() {

  gulp.src([
	'./assets/cmgae/utils.js',
	'./assets/cmgae/moduloSonido.js',
    './assets/cmgae/moduloActividad.js',
    './assets/cmgae/moduloHttp.js',
    './assets/cmgae/moduloLocal.js',
    './assets/cmgae/moduloEditorTexto.js',
	'./assets/cmgae/moduloArchivos.js',
	'./assets/cmgae/moduloArbolArchivos.js',
	'./assets/cmgae/moduloApp.js',
	'./assets/cmgae/moduloImagenes.js',
	'./assets/cmgae/moduloEdicion.js',
	'./assets/cmgae/moduloMenus.js',
	'./assets/cmgae/moduloJuegoVista.js',
  ]).pipe(concat('modulos.min.js'))
    .pipe(babel())
    //.pipe(uglify())
    .pipe(gulp.dest('assets/dist'));
  
});
