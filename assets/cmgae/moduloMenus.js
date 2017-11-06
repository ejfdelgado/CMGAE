if (!hayValor(moduloMenus)) {
var moduloMenus = (function() {
	
	var pilaLocal = [];
	
	var cargarHtml = function(ruta) {
		return moduloHttp.get('/assets/cmgae/menus'+ruta);
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
	
	var notificar = function(promesa) {
		$.when(promesa).then(function() {
			mostrarMenuSoloTexto('Hecho!');
		}, function() {
			mostrarMenuSoloTexto('Error :(');
		});
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
			},
			html: {}
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
		for (var clase in mapa.html) {
			nodo.find(clase).html(mapa.html[clase]);
		}
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
		pila.push('menu_pagina');
		$('.menu_core').toggleClass('invisible');
		$('.menu_pagina').toggleClass('invisible');
		window.scrollTo(0,0);
	};
	
	var mostrarFormularioEdicion = function(nodo, atributo, valor, sufijo) {
		pila.push("formhtml");
		console.log('mostrarFormularioEdicion', nodo, atributo, valor)
		$(".formhtml").attr('nodo2', nodo);
		$(".formhtml").attr('property2', atributo);
		$(".formhtml").attr('sufijo', sufijo);
		$('.formhtml textarea').val(valor);
		$('.formhtml').removeClass('invisible');
	};
	
	$(document).keyup(function(e) {
	  if (e.keyCode == 27) {
	  	if (pilaLocal.length == 0) {
	  		mostrarMenuBasico();
	  	} else {
	  		sacarUltimo();
	  	}
	  }
	});
	
	return {
		'mostrarMenuPagina': mostrarMenuPagina,
		'mostrarFormularioEdicion': mostrarFormularioEdicion,
		'mostrarMenuBasico': mostrarMenuBasico,
		'mostrarMenuSoloTexto': mostrarMenuSoloTexto,
	};
})();
}