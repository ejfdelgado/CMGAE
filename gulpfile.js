
var gulp = require('gulp')
, uglify = require("gulp-uglify")
, concat = require("gulp-concat")
, gulpCopy = require("gulp-copy")
, babel = require("gulp-babel");

gulp.task('default', function() {

  gulp.src(['./bower_components/chart.js/dist/Chart.min.js'])
  .pipe(gulpCopy('./assets/js/chartjs/', { prefix: 3 }));
  
  gulp.src(['./bower_components/jquery/dist/jquery.min.js'])
  .pipe(gulpCopy('./assets/js/comun/', { prefix: 3 }));
	
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
