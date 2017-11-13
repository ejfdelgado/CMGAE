
if (!hayValor(moduloArchivos)) {
var moduloArchivos = (function() {
	var MAX_FILE_SIZE = 500*1024;//en KB
	var PREFIJO_LOCAL = '/app_default_bucket';
	
	var completarPredeterminados = function(atributos) {
		var mapa = {
			'maximoTamanio': MAX_FILE_SIZE,
			'tipos': 'image/*',
			'auto': 'true',
			'dataFolder': '/imagenesbasico',
		}
		for (let llave in mapa) {
			if (!hayValor(atributos[llave])) {
				atributos[llave] = mapa[llave];
			}
		}
		return atributos;
	};
	
	var subirArchivo = function(atributos) {
		var diferido = $.Deferred();
		atributos = completarPredeterminados(atributos);
		var temp = $('<input type="file" class="invisible" accept="'+atributos.tipos+'">');
	    temp.on("change", function (e) {
	        var file = e.target.files[0];
	        if (file.size > atributos.maximoTamanio) {
	        	alert('Archivo muy grande! debe ser menor a '+(atributos.maximoTamanio/(1024))+' KB');
	        	diferido.reject();
	        	return;
	        }
	        var subirReal = function() {
		        var reader = new FileReader();
		        reader.readAsDataURL(file);
		        var form = new FormData();
		        form.append('file-0', file);
		        form.append('folder', atributos.dataFolder);
		        if (hayValor(atributos.id)) {
		        	form.append('name', atributos.id);
		        }
		        if (atributos.auto == 'false') {
		        	form.append('auto', 'false');
	        	}
		        //Sobra porque el servidor ya lo está capturando
		        //form.append('mime', file.type);
		        moduloActividad.on();
		        $.ajax({
		            url: '/storage/',
		            type: 'POST',
		            data: form,
		            headers:moduloHttp.darHeader(),
		            cache: false,
		            contentType: false,
		            processData: false,
		        }).done(function(data) {
		        	if (data.error != 0) {
		        		diferido.reject();
		        	} else {
		        		diferido.resolve(data);
		        	}
		        }).fail(function() {
		        	diferido.reject();
		        }).always(function() {
		        	moduloActividad.off();
		        });
	        };
	        
	        if (estaEnLista(file.name, atributos.opcionesNegras)) {
	        	var promesaConf = moduloMenus.confirmar();
	        	$.when(promesaConf).then(function() {
	        		subirReal();
	        	});
	        } else {
	        	subirReal();
	        }
	    });
	  temp.click();
	  return diferido.promise();
	}
	
	var escribirTextoPlano = function(id, contenido) {
		var diferido = $.Deferred();
		var blobAttrs = { type: "text/plain"};
		var file = new File([contenido], id, blobAttrs);
		var form = new FormData();
        form.append('file-0', file);
        form.append('auto', 'false');
        form.append('name', id);
        moduloActividad.on();
        $.ajax({
            url: '/storage/',
            type: 'POST',
            data: form,
            headers:moduloHttp.darHeader(),
            cache: false,
            contentType: false,
            processData: false,
        }).done(function(data) {        	
        	if (data.error != 0) {
        		diferido.reject();
        	} else {
        		diferido.resolve();
        	}
        }).fail(function() {
        	diferido.reject();
        }).always(function() {
        	moduloActividad.off();
        });
		return diferido.promise();
	};
	
	var leerTextoPlano = function(id) {
		var diferido = $.Deferred();
		moduloActividad.on();
        $.ajax({
            url: generarUrlDadoId(id),
            type: 'GET',
            cache: false,
            contentType: false,
            processData: false,
        }).done(function(data) {
        	console.log(data);
        	diferido.resolve(data);
        }).fail(function() {
        	diferido.reject();
        }).always(function() {
        	moduloActividad.off();
        });
        return diferido.promise();
	};
	
	var darNombreId = function(unId) {
		var PATRON_NOMBRE = /(\/)([^\/]*)$/ig;
		var partes = PATRON_NOMBRE.exec(unId);
		if (partes == null) {return null;}
		return partes[2];
	};
	
	var normalizarId = function(unId) {
		if (unId.startsWith(PREFIJO_LOCAL)) {
			unId = unId.substring(PREFIJO_LOCAL.length);
		}
		return unId;
	};
	
	var generarUrlDadoId = function(unId) {
		var valor;
		if (moduloApp.esProduccion()) {
			valor = 'http://storage.googleapis.com'+unId+'?' + new Date().getTime();
		} else {
			unId = normalizarId(unId);
			valor = '/storage/read?name='+encodeURIComponent(unId)
		}
		return valor;
	};
	
	var darIdDadoUrl = function(direccion) {
		if (!hayValor(direccion)) {return null;}
		if (moduloApp.esProduccion()) {
			var PATRON_GOOGLE_STORAGE = /^(https?:\/\/storage\.googleapis\.com)([^\?]*)(\?.*)?$/ig;
			let partes = PATRON_GOOGLE_STORAGE.exec(direccion);
			if (partes != null && partes.length >= 3) {
				return partes[2];
			}
		} else {
			var PATRON_LOCAL_STORAGE = /(\/storage\/read\?name=)(.*)/ig;
			let partes = PATRON_LOCAL_STORAGE.exec(direccion);
			if (partes != null && partes.length >= 3) {
				return partes[2];
			}
		}
		return null;
	};
	
	var borrar = function(unId) {
		var url = '/storage/borrar?name=';
		if (moduloApp.esPruebas()) {
			url+=PREFIJO_LOCAL;
		}
		url+=encodeURIComponent(unId);
		return moduloHttp.borrar(url);
	}
	
	return {
		'darNombreId': darNombreId,
		'normalizarId': normalizarId,
		'leerTextoPlano': leerTextoPlano,
		'escribirTextoPlano': escribirTextoPlano,
		'subirArchivo': subirArchivo,
		'generarUrlDadoId': generarUrlDadoId,
		'darIdDadoUrl': darIdDadoUrl,
		'borrar': borrar,
		'completarPredeterminados': completarPredeterminados,
	};
})();
}
