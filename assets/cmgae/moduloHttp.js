if (!hayValor(moduloHttp)) {
	var moduloHttp = (function() {
		
		var call = function(url, metodo, encabezados, usarCache) {
			if (!hayValor(usarCache)) {
				usarCache = false;
			}
			var diferido = $.Deferred();
		    moduloActividad.on();
		    var peticion = {
		        'url': url,
		        'type': metodo,
		        'cache': usarCache,
		    };
		    if (hayValor(encabezados)) {
		    	peticion.headers = encabezados;
		    }
		    $.ajax(peticion).done(function(datos) {        	
		    	diferido.resolve(datos);
		    }).fail(function() {
		    	diferido.reject();
		    }).always(function() {
		    	moduloActividad.off();
		    });
			return diferido.promise();
		};
		
		var get = function(url, usarCache) {
			return call(url, 'GET', null, usarCache)
		};
		
		var borrar = function(url) {
			return call(url, 'DELETE')
		};
		
		var post = function(url) {
			return call(url, 'POST', darHeader());
		};
		
		var darToken = function() {
			return $('[name="csrfmiddlewaretoken"]').val();
		};
		
		var darHeader = function() {
			return {
            	'X-CSRFToken':darToken(),
            };
		};
		
		return {
			'get': get,
			'borrar': borrar,
			'darToken': darToken,
			'darHeader': darHeader,
		}
	})();
}