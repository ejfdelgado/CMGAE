
var gulp = require('gulp')
, uglify = require("gulp-uglify")
, concat = require("gulp-concat")
, gulpCopy = require("gulp-copy")
, babel = require("gulp-babel");

gulp.task('default', function() {

  gulp.src(['./bower_components/chart.js/dist/Chart.min.js'])
  .pipe(gulpCopy('./assets/js/chartjs/', { prefix: 10 }));
  
  gulp.src(['./bower_components/jquery.enhsplitter/js/jquery.enhsplitter.js'])
  .pipe(gulpCopy('./assets/js/enhsplitter/', { prefix: 10 }));
  
  gulp.src(['./bower_components/jstree/dist/**/*'])
  .pipe(gulpCopy('./assets/js/jstree/', { prefix: 3 }));
  
  //gulp.src(['./bower_components/ace/lib/ace/**/*'])
  //.pipe(gulpCopy('./assets/js/ace/', { prefix: 4 }));
  
  gulp.src(['./bower_components/bootstrap/dist/js/bootstrap.min.js'])
  .pipe(gulpCopy('./assets/js/bootstrap/', { prefix: 10 }));
  
  gulp.src([
            './bower_components/jquery/jquery.min.js',
            './bower_components/jquery/dist/jquery.min.js'
            ])
  .pipe(gulpCopy('./assets/js/comun/', { prefix: 10 }));
	
  gulp.src([
	'./assets/cmgae/utils.js',
	'./assets/cmgae/seguridad.js',
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
	'./assets/cmgae/moduloHistoria.js',
	'./assets/cmgae/moduloJuegoVista.js',
	'./assets/cmgae/moduloTimer.js',
  ]).pipe(concat('modulos.min.js'))
    .pipe(babel())
    //.pipe(uglify())
    .pipe(gulp.dest('assets/dist'));
  
});
