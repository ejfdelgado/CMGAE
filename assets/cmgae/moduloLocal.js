
if (!hayValor(moduloLocal)) {
	var moduloLocal = (function() {
		var props = {
			'lengua': LENGUAJE,
		};
		
		var datos = null;
		
		var inicializar = function() {
			var promesa = moduloHttp.get('/assets/cmgae/local/'+props.lengua+'.json');
			$.when(promesa).then(function(nuevos) {
				datos = JSON.parse(nuevos);
			})
		};
		
		var traducir = function(llave) {
			if (!esObjeto(datos)) {return llave;}
			return leerObj(datos, llave, llave);
		};
		
		var procesarElemento = function(elem) {
			$.each(elem.find('.traducir'), function(i, hijoB) {
				var hijo = $(hijoB);
				var llave = hijo.text();
				if (esMultilenguaje(llave)) {
					var traducido = traducir(llave);
					if (traducido != llave) {
						hijo.html(traducido);
					}
				}
			});
		};
		
		inicializar();
		
		return {
			'traducir': traducir,
			'procesarElemento': procesarElemento,
		};
	})();
}