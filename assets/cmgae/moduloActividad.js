
//TODO homologar con waitOn y waitOff
if (!hayValor(moduloActividad)) {
var moduloActividad = (function() {
	var pendientes = 0;
	var actividadOn = function(mensaje) {
		if (!hayValor(mensaje)) {
			mensaje = '';
		}
		if (pendientes == 0) {
			var nuevo = $('<div id="loading"><p></p></div>');
			nuevo.find('p').html(mensaje);
			$('body').append(nuevo);
		}
		pendientes++;
	};

	var actividadOff = function() {
		pendientes--;
		if (pendientes<=0) {
			pendientes = 0;
			$('#loading').remove();
		}
	};
	
	return {
		on: actividadOn,
		off: actividadOff,
	}
})();
}