
$(document).ready(function() {
	var promesaLocal = moduloLocal.inicializar();
	$.when(promesaLocal).then(function() {
		moduloMenus.inicializar();
		moduloContactenos.inicializar();
	});
});