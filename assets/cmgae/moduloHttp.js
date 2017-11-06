if (!hayValor(moduloHttp)) {
	var moduloHttp = (function() {
		
		var get = function(url) {
			var diferido = $.Deferred();
		    moduloActividad.on();
		    $.ajax({
		        'url': url,
		        'type': 'GET',
		        'cache': false,
		    }).done(function(datos) {        	
		    	diferido.resolve(datos);
		    }).fail(function() {
		    	diferido.reject();
		    }).always(function() {
		    	moduloActividad.off();
		    });
			return diferido.promise();
		};
		
		return {
			'get': get,
		}
	})();
}