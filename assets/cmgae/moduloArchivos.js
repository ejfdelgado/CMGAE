
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
            url: generarUrlDadoId(id, true),
            type: 'GET',
            cache: false,
            contentType: false,
            processData: false,
        }).done(function(data) {
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
	
	var normalizarId = function(unId, poner) {
		if (!hayValor(poner)) {
			poner = false;
		}
		var prefijo = null;
		if (moduloApp.esProduccion()) {
			prefijo = moduloApp.darRaizCloudStorage();
		} else {
			prefijo = PREFIJO_LOCAL;
		}
		if (poner === true) {
			if (!unId.startsWith(prefijo)) {
				unId = prefijo+unId;
			}
		} else {
			if (unId.startsWith(prefijo)) {
				unId = unId.substring(prefijo.length);
			}
		}
		return unId;
	};
	
	var generarUrlDadoId = function(unId, local) {
		var valor;
		if (local!= true && moduloApp.esProduccion()) {
			unId = normalizarId(unId, true);
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
		url+=encodeURIComponent(unId);
		return moduloHttp.borrar(url);
	};
	
	var renombrar = function(viejo, nuevo) {
		var url = '/storage/renombrar?';
		url+='viejo='+encodeURIComponent(viejo);
		url+='&nuevo='+encodeURIComponent(nuevo);
		return moduloHttp.get(url);
	};
	
	var crearBasico = function() {
		var idIndex = '/public/index.html';
		var promesa = leerTextoPlano(idIndex);
		$.when(promesa).then(function(datos) {
			let temp = leerObj(datos, 'error', null);
			if (esNumero(temp) && temp != 0) {
				//Se busca crear
				let contenido = '{% extends "base.html" %}{% block content %}It works from cloud storage!{% endblock %}';
				let promesaEscritura = escribirTextoPlano(idIndex, contenido);
				$.when(promesaEscritura).then(function() {
					location.reload();
				});
			}
		});
	};
	
	return {
		'darNombreId': darNombreId,
		'normalizarId': normalizarId,
		'leerTextoPlano': leerTextoPlano,
		'escribirTextoPlano': escribirTextoPlano,
		'subirArchivo': subirArchivo,
		'generarUrlDadoId': generarUrlDadoId,
		'darIdDadoUrl': darIdDadoUrl,
		'borrar': borrar,
		'renombrar': renombrar,
		'completarPredeterminados': completarPredeterminados,
		'crearBasico': crearBasico,
	};
})();
}
