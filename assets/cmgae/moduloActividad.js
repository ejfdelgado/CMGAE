
//TODO homologar con waitOn y waitOff
var moduloActividad = (function() {
	var pendientes = 0;
	var actividadOn = function() {
		if (pendientes == 0) {
			$('body').append('<div id="loading"><p>Procesando petici&oacute;n...</p></div>');
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