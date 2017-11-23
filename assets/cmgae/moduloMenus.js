if (!hayValor(moduloMenus)) {
var moduloMenus = (function() {
	
	var pilaLocal = [];
	
	var cargarHtml = function(ruta) {
		return moduloHttp.get('/assets/cmgae/menus'+ruta, true);
	};
	
	var esUltimoId = function(id) {
		if (pilaLocal.length == 0){return false;}
		return (pilaLocal[pilaLocal.length-1].id==id);
	};
	
	var sacarUltimo = function() {
		if (pilaLocal.length == 0){return;}
		var elem = pilaLocal[pilaLocal.length-1].nodo;
		elem.remove();
		pilaLocal.pop();
	};
	
	var mostrarMenuSoloTexto = function(texto) {
		var promesa = cargarHtml('/soloTexto.html');
		$.when(promesa).then(function(datos) {
			agregarNodoPila('alerta', datos, {html: {'.mensaje_texto': texto}});
		});
	};
	
	var error = function() {
		mostrarMenuSoloTexto(moduloLocal.traducir('menus.mensajes.error'));
	};
	
	var notificar = function(promesa) {
		$.when(promesa).then(function() {
			mostrarMenuSoloTexto(moduloLocal.traducir('menus.mensajes.hecho'));
		}, error);
	};
	
	var verPropiedadesDePagina = function() {
		$('.menu_pagina').removeClass('invisible');
	};
	
	var esconderPropiedadesDePagina = function() {
		$('.menu_pagina').addClass('invisible');
	};
	
	var activarNodo = function(nodo, otroMapa) {
		moduloLocal.procesarElemento(nodo);
		var mapa = {
			funciones: {
				'.menu_opc_ingresar': moduloApp.login,
				'.menu_opc_salir': moduloApp.logout,
				'.menu_opc_borrar_cache': moduloApp.borrarCache,
				'.create-ui-toggle2': moduloApp.abrirBarraEdicion,
				'.menuEliminar': moduloEdicion.funcElegirBorrar,
				'.menu_opc_propiedades_pagina': verPropiedadesDePagina,
			},
			html: {},
			botones: {},
		};
		mapa = $.extend(mapa, otroMapa);
		$.each(mapa.funciones, function(clase, funcion) {
			nodo.find(clase).on('click', function() {
				sacarUltimo();
				var promesa = funcion();
				if (hayValor(promesa)) {
					notificar(promesa);
				}
			});
		});
		if (esObjeto(mapa.botones)) {
			var contenedor = $('<div class="row"><div class="col-xs-12"><div class="text-right botones-aca"></div></div></div>');
			var predefinido = {texto:'?', clase:'btn-primary', accion: function() {}};
			$.each(mapa.botones, function(llave, detalle) {
				predefinir(detalle, predefinido);
				var nuevoBoton = $('<button type="button" class="btn btn-xs"></button>');
				nuevoBoton.on('click', detalle.accion);
				nuevoBoton.addClass(detalle.clase);
				nuevoBoton.text(detalle.texto);
				contenedor.find('.botones-aca').append(nuevoBoton);
			});
			nodo.append(contenedor);
		}
		for (var clase in mapa.html) {
			nodo.find(clase).html(mapa.html[clase]);
		}
	};
	
	var confirmar = function() {
		var promesa = cargarHtml('/confirmar.html');
		var diferido = $.Deferred();
		$.when(promesa).then(function(data) {
			var otros = {
				'botones': {
					'aceptar': {
						'texto': moduloLocal.traducir('menus.botones.aceptar'),
						'clase':'btn-success',
						'accion': function() {
							sacarUltimo();
							diferido.resolve();
						}
					},
					'cancelar': {
						'texto': moduloLocal.traducir('menus.botones.cancelar'),
						'clase':'btn-danger',
						'accion': function() {
							sacarUltimo();
							diferido.reject();
						}
					}
				}	
			};
			agregarNodoPila('confirmacion', data, otros);
		});
		return diferido.promise();
	};
	
	var agregarNodoPila = function(ID, data, otroMapa) {
		var nodo = $(data);
		$('body').append(nodo);
		pilaLocal.push({'id': ID, 'nodo': nodo});
		activarNodo(nodo, otroMapa);
	};
	
	var mostrarMenuBasico = function() {
		var ID = 'menu';
		var diferido = $.Deferred();
		if (esUltimoId(ID)) {
			sacarUltimo();
			diferido.reject();
			return diferido.promise();
		}
		var promesa = null;
		if (moduloApp.esUsuario()) {
			if (moduloApp.esAdmin()) {
				promesa = cargarHtml('/menuInicialAdmin.html');
			} else {
				promesa = cargarHtml('/menuInicialAnonimo.html');
			}
		} else {
			promesa = cargarHtml('/menuInicialAnonimo.html');
		}
		$.when(promesa).then(function(data) {
			agregarNodoPila(ID, data);
			diferido.resolve();
		});
		return diferido.promise();
	};
	
	var mostrarMenuPagina = function() {
		//TODO reconfigurar
		pila.push('menu_pagina');
		$('.menu_core').toggleClass('invisible');
		$('.menu_pagina').toggleClass('invisible');
		window.scrollTo(0,0);
	};
	
	var mostrarFormularioEdicion = function(nodo, atributo, valor, sufijo) {
		//TODO reconfigurar
		$(".formhtml").attr('nodo2', nodo);
		$(".formhtml").attr('property2', atributo);
		$(".formhtml").attr('sufijo', sufijo);
		$('.formhtml textarea').val(valor);
		$('.formhtml').removeClass('invisible');
	};
	
	var inicializar = function() {
		var diferido = $.Deferred();
		$(document).keyup(function(e) {
		  if (e.keyCode == 27) {
			esconderPropiedadesDePagina();
		  	if (pilaLocal.length == 0) {
		  		mostrarMenuBasico();
		  	} else {
		  		sacarUltimo();
		  	}
		  }
		});
		diferido.resolve();
		return diferido.promise();
	};
	
	return {
		'inicializar': inicializar,
		'mostrarMenuPagina': mostrarMenuPagina,
		'mostrarFormularioEdicion': mostrarFormularioEdicion,
		'mostrarMenuBasico': mostrarMenuBasico,
		'mostrarMenuSoloTexto': mostrarMenuSoloTexto,
		'confirmar': confirmar,
		'sacarUltimo': sacarUltimo,
		'error': error,
	};
})();
}