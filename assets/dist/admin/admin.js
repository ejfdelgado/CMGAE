
$(document).ready(function() {
	var promesaLocal = moduloLocal.inicializar();
	$.when(promesaLocal).then(function() {
		moduloMenus.inicializar();
		var params = darParametrosUrl();
		if (moduloApp.esAdmin() && params.editar != 'false') {
			moduloEdicion.inicializar();
		}
	});
});