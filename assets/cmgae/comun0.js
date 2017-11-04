
/* Funciones comunes y carrito! */

var LLAVE_CARRITO = 'CARRITO_LOCAL';
var LLAVE_PRODS_CARR = 'TEMP_PRODS';

var TRADUCTOR = {
	'verif_campo' : {'esp': 'Verifique el campo ', 'eng': 'Verify the field '},
	'cache_borr_ok' : {'esp': "Cache borrada!", 'eng':'Erased cache!'},
	'error_ajax' : {'esp':"Error al invocar ajax", 'eng':'Ajax invocation error'},
};

/*
Funci�n que facilita la configuraci�n de listas de datos con Midgard
La configuraci�n de listas es algo como:
{
	'Caracteristica': {
		ejemplo: '#CaracteristicaEjemplo',
		campos: [
		         {nombre:'imagen', tipo:'Text'},
		         {nombre:'titulo', tipo:'TextSimple'},
		         {nombre:'contenido', tipo:'nuevo'},
		],
		listas: [{nombre:'lista1'}],
	}
}
 */
function configurarListasEditor(vie, configuracionListas) {
    vie.use(new vie.RdfaService());
    
    for (let tipoNombre in configuracionListas) {
    	let tipoNombreRel = tipoNombre+'Rel';
    	let unTipo = configuracionListas[tipoNombre];
    	let confCampos = [];
    	for (let i=0; i<unTipo.campos.length; i++) {
    		let unCampo = unTipo.campos[i];
    		confCampos.push({'id': unCampo.nombre, 'range': unCampo.tipo, 'min': 0, 'max': 1});
    	}
    	vie.types.add(tipoNombre, confCampos);
    	for (let j=0; j<unTipo.listas.length; j++) {
    		let elem = unTipo.listas[j];
    		vie.types.add(elem.nombre, [{id:tipoNombreRel, range:tipoNombre, min: 0, max: -1}]);
    	}
    	vie.service('rdfa').setTemplate(tipoNombre, tipoNombreRel, jQuery(unTipo.ejemplo).html());
    }
};

function tieneAtributo(elem, name) {
	var attr = elem.attr(name);
	return (typeof attr !== typeof undefined && attr !== false)
}

function borrarLocalStorage() {
	localStorage.removeItem(LLAVE_CARRITO);
	localStorage.removeItem(LLAVE_PRODS_CARR);
}

if (HAS_USER !== true) {
	borrarLocalStorage();
}

function postLogin() {
	borrarLocalStorage();
}

function postLogout() {
	borrarLocalStorage();
}

function waitOn() {
	$('#loadingDiv').removeClass('invisible');
}

function waitOff() {
	$('#loadingDiv').addClass('invisible');
}

function toDate(texto) {
    var from = texto.split("/");
    return new Date(from[2], from[1] - 1, from[0]);
}

function formatearFecha(objeto, formato1) {
	var fechaTexto = objeto.attr("data-value");
	if (fechaTexto) {
		var fecha = new Date(0);
		try {
			fecha.setUTCSeconds(parseInt(fechaTexto));
		} catch (e) {}
		objeto.find("[data-format]").each(function(index, element) {
			var actual = $(element);
			var formato = actual.attr("data-format");
			var formateado = $.format.date(fecha.getTime(), formato);
			actual.text(formateado);
		});
		if (formato1 !== undefined)
			return $.format.date(fecha.getTime(), formato1);
	}
	return "";
}

function darValorFechaFormateado(texto) {
	
}

function formatearFechaElem(elemento){
	elemento.find("[dateProperty]").each(function(index, element) {
		var actual = $(element);
		formatearFecha(actual);
	});
}

formatearFechaElem($('body'));

function llenarTemplate(nuevo, dato) {
	nuevo.find("[property]").each(function(index, element) {
		var actual2 = $(element);
		var nombre = actual2.attr('property');
		var nombre2 = nombre+'_'+LENGUAJE;
		var valor0 = dato[nombre2];
		var valor1 = dato[nombre];
		var valor = valor0;
		if (valor === undefined) {
			valor = valor1;
		}
		if (valor !== undefined) {
			if (actual2.prop("tagName") == 'IMG') {
				actual2.attr("src", valor);
			} else {
				actual2.html(valor);
			}
		}
	});
	nuevo.find("[dateProperty]").each(function(index, element) {
		var actual2 = $(element);
		var nombre = actual2.attr('dateProperty');
		var valor = dato[nombre]; 
		if (valor !== undefined) {
			actual2.attr("data-value", valor);
		}
	});
	formatearFechaElem(nuevo);
}

function mostrarMensaje(papa, msg, clase) {
	var tag = 'div';
	var papaTag = papa.prop("tagName");
	if (papaTag == 'UL' || papaTag == 'OL') {tag='li';}
	var elerror = $('<'+tag+' property="'+clase+'" class="'+clase+'"></'+tag+'>');
	elerror.text(msg);
	papa.prepend(elerror);
}



//valida un elemento input que responda a val(), prefiere placeholder y despu�s name
function escorrecto(elemento) {
	var validacion = elemento.attr('validacion');
	var nombre = elemento.attr('placeholder');
	if (nombre === undefined) {nombre = elemento.attr('name');}
	if (validacion !== undefined) {
		if (nombre === undefined) {nombre = validacion;}
		var re = new RegExp(validacion, "gi");
		if(!elemento.val().match(re)) {
			return {error:1, msg: TRADUCTOR['verif_campo'][LENGUAJE]+nombre};
		}
	}
	return {error: 0};
};

/* Llena los campos de un formulario, prefiere name y luego placeholder */
function llenarCampos(nuevo, data) {
	//Se asignan los inputs
	nuevo.find('input[type=text],select,textarea').each(function(i, elem) {
		var self = $(elem);
		var nombre = self.attr('name');
		if (nombre === undefined) {nombre = self.attr('placeholder');}
		if (nombre in data) {
			self.val(data[nombre]);
		}
	});
	
	nuevo.find('input[type=checkbox]').each(function(i, elem) {
		var self = $(elem);
		var nombre = self.attr('name');
		if (nombre === undefined) {nombre = self.attr('placeholder');}
		if (nombre in data) {
			if (data[nombre] == 1) {
				self.prop('checked', true);
			} else {
				self.prop('checked', false);
			}
		}
	});
	
	nuevo.find('input[type=radio]').each(function(i, elem) {
		var self = $(elem);
		var nombre = self.attr('name');
		if (nombre === undefined) {nombre = self.attr('placeholder');}
		if (nombre in data) {
			if (data[nombre] == self.attr('value')) {
				self.prop('checked', true);
			} else {
				self.prop('checked', false);
			}
		}
	});
}

/* Lee los campos de un formulario, prefiere name y luego placeholder */
function capturarFormulario(item, data) {
	var ans = [];
	//Primero ejecuta las validaciones sobre input[text] y textarea
	item.find('input[type=text],textarea').each(function(i, elem) {
		var self = $(elem);
		var codigo = escorrecto(self);
		ans.push(codigo);
	});
	
	item.find('input[type=text],select,textarea,input[type=radio]:checked').each(function(i, elem) {
		var self = $(elem);
		var nombre = self.attr('name');
		if (nombre === undefined) {nombre = self.attr('placeholder');}
		if (nombre !== undefined) {
			var valor = self.val();
			data[nombre] = valor;
		}
	});
	
	item.find('input[type=checkbox]').each(function(i, elem) {
		var self = $(elem);
		var nombre = self.attr('name');
		if (nombre === undefined) {nombre = self.attr('placeholder');}
		if (nombre !== undefined) {
			var valor = self.is(':checked') ? 1 : 0;
			data[nombre] = valor;
		}
	});
	
	return ans;
}

(function($) {
	var memoriaGlobal = {};
	/**
	 * Sirve para enviar mensajes:
	 * 
	 * <div class="contenedor-envio-mensajes">
	 * <a class="boton-envio-mensaje button special">Enviar</a>
	 * 
	 * Tambi�n para hacer CRUD de datos del usuario
	 * 
	 * <div class="contenedor-envio-mensajes" data-preload="/user/personal">
	 * <a class="boton-envio-mensaje" data-url="/user/personal" data-once="false">Salvar</a>
	 */
	$('.contenedor-envio-mensajes[data-preload]').each(function(i, elem) {
		var self = $(this);
		var url = self.attr('data-preload');
		if (url === undefined || url.length == 0) {return;}
		$.ajax({
			type: "GET",
			url: url,
			contentType: "application/json; charset=utf-8",
		})
		.done(function( msg ) {
			llenarCampos(self, msg);
		})
		.fail(function( jqXHR, textStatus ) {
			console.log('Error precargando '+url);
		});
	});
	
	//Se activan los formularios y sus respectivos botones
	$(".boton-envio-mensaje").on('click', function() {
		waitOn();
		var self = $(this);
		var url = self.attr('data-url');
		if (url === undefined || url.length == 0) {
			url = '/act/correo';
		}
		var esconder = self.attr('data-once');
		if (esconder === undefined || esconder.length == 0) {
			esconder = true;
		} else {esconder = false;}
		
		var papa = self.closest('.contenedor-envio-mensajes');
		if (!papa) {return;}

		papa.find("[property='error']").remove();
		papa.find('[property="gracias"]').addClass('invisible');
		
		var dicci = {};
		var codigos = capturarFormulario(papa, dicci);
		
		var errores = 0;
		for (var i=0; i< codigos.length; i++) {
			var codigo = codigos[i];
			if (codigo.error != 0) {
				mostrarMensaje(papa, codigo.msg, 'error');
				errores++;
			}
		}
		
		if (errores > 0) {
			waitOff();
			return;
		}

		$.ajax({
			type: "PUT",
			url: url,
			data: JSON.stringify(dicci),
			contentType: "application/json; charset=utf-8",
		})
		.done(function( msg ) {
			if (msg.error == 0) {
				if (esconder) {
					papa.children().addClass('invisible');
				}
				papa.find('[property="gracias"]').removeClass('invisible');
			} else {
				mostrarMensaje(papa, msg.msg, 'error');
			}
			waitOff();
		})
		.fail(function( jqXHR, textStatus ) {
			mostrarMensaje(papa, textStatus, 'error');
			waitOff();
		});
	});
	
	
	/*********** CARRITO **************/
	
	function escribirCarritoRemoto(data, exitofun, errorfun) {
		leerCarritoLocal(function(data) {
			$.ajax({
				type: "PUT",
				url: '/carrito/',
				data: JSON.stringify(data),
				contentType: "application/json; charset=utf-8",
			})
			.done(function( msg ) {
				exitofun();
			})
			.fail(function( jqXHR, textStatus ) {
				errorfun('Error guardando carrito:'+textStatus);
			});
		}, function(e) {
			errorfun('error leyendo carrito:'+e);
		});
	}
	
	function escribirCarritoLocal(obj) {
		var llave = LLAVE_CARRITO;
		localStorage[llave] = JSON.stringify(obj);
	}
	
	function leerCarritoLocal(callback, errorcall) {
		try {
			var contenidotxt = localStorage[LLAVE_CARRITO];
			var contenido = undefined;
			
			if (contenidotxt !== undefined) {
				try {contenido = JSON.parse(contenidotxt);} catch (e) {}
			}
			
			if (contenidotxt === undefined || (contenidotxt !== undefined && contenido === undefined)) {
				//se ejecuta get para buscar
				$.ajax({
					type: "GET",
					url: '/carrito/',
					contentType: "application/json; charset=utf-8",
				})
				.done(function( msg ) {
					try {
						JSON.parse(msg.json);
						contenidotxt = msg.json;
					} catch (e) {contenidotxt = "{}";}
					localStorage[LLAVE_CARRITO] = contenidotxt;
					contenido = JSON.parse(contenidotxt);
					callback(contenido);
				})
				.fail(function( jqXHR, textStatus ) {
					errorcall(textStatus);
				});
				
			} else {
				callback(contenido);
			}
		} catch (e) {
			errorcall(e);
		}
	}
	
	function quitarDeCarrito(llave) {
		waitOn();
		leerCarritoLocal(function(data) {
			if (llave in data) {
				delete data[llave];
				escribirCarritoLocal(data);
			}
			waitOff();
		}, function(e) {
			console.log('error leyendo carrito:'+e);
			waitOff();
		});
	}
	//TODO
	function agregarACarrito(llave) {
		waitOn();
		leerCarritoLocal(function(data) {
			if (!(llave in data)) {
				data[llave] = {};
				escribirCarritoLocal(data);
			}
			
			completarInfoProductosBase(undefined, [llave], function() {waitOff();}, function() {console.log('error completando productos de carrito');})
		}, function(e) {
			console.log('error leyendo carrito:'+e);
			waitOff();
		});
	}
	
	function darMemoriaProds() {
		var memoriatxt = localStorage[LLAVE_PRODS_CARR];
		if (memoriatxt === undefined) {
			memoriatxt = '{}';
		}
		var memoria = JSON.parse(memoriatxt);
		return memoria;
	}
	
	function escrMemoriaProds(memoria) {
		localStorage[LLAVE_PRODS_CARR] = JSON.stringify(memoria);
	}
	
	function completarInfoProductosBase(lista, listaBusq, callback, errorcall) {
		function llenarDatosProds(lista, memoria) {
			lista.find('[about][typeof]').each(function(i, elem) {
				var nuevo = $(elem);
				var llave = nuevo.attr('typeof')+'/'+nuevo.attr('about');
				if (llave in memoria) {
					llenarTemplate(nuevo, memoria[llave]);
				}
			});
		}
		
		if (listaBusq.length == 0) {
			//Si la lista de productos nuevos que no est�n en local storage es vacia:
			if (lista !== undefined) {
				llenarDatosProds(lista, memoriaGlobal);
			}
			callback();
		} else {
			$.ajax({
				type: "PUT",
				url: '/productos/',
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(listaBusq),
			})
			.done(function( msg ) {
				if (msg.error == 0) {
					var data = msg.data;
					for (let llave in data) {
						memoriaGlobal[llave] = data[llave];
					}
					escrMemoriaProds(memoriaGlobal);
					if (lista !== undefined) {
						llenarDatosProds(lista, memoriaGlobal);
					}
					callback();
				} else {
					errorcall();
				}
			})
			.fail(function(jqXHR, textStatus ) {
				errorcall();
			});
		}
	}
	
	/**
	 * Completa en el elemento 'lista' los productos que est�n all� con datos de contenido [about][typeof]
	 */
	function completarInfoProductos(lista, callback, errorcall) {
		try {
			var listaBusq = [];
			var memoria = darMemoriaProds();
			lista.find('[about][typeof]').each(function(i, elem) {
				var self = $(elem);
				var llave = self.attr('typeof')+'/'+self.attr('about');
				if (!(llave in memoria)) {
					listaBusq.push(llave);
				}
			});
			
			completarInfoProductosBase(lista, listaBusq, callback, errorcall);
		} catch (e) {
			console.log(e)
		}
	}
	
	function cargarListaCarrito() {
		var lista = $('#listaCarrito');
		
		if (lista !== undefined) {
			waitOn();
			try {
				lista.empty();
				leerCarritoLocal(function(data) {
					for (let llave in data) {
						//Se recorre cada producto
						var tokens = llave.split(/\/(.+)?/);
						var tipo = tokens[0];
						var about = tokens[1];
						
						//Se busca el template y se agrega
						var idPlantilla = 'Carrito'+tipo;
						var plantilla = document.getElementById(idPlantilla);
						if (plantilla === undefined || plantilla === null) {waitOff();return;}
						
						var nuevo = $(plantilla.innerHTML);
						nuevo.attr('about', about);
						
						llenarCampos(nuevo, data[llave]);
						
						nuevo.find('.carrito_borrar').click(function() {
							var self = $(this);
							var papa = self.closest('[about]');
							if (papa) {
								quitarDeCarrito(papa.attr('typeof')+'/'+papa.attr('about'));
								papa.remove();
							}
						});
						
						lista.append(nuevo);
					}
					
					completarInfoProductos(lista, function() {waitOff();}, function() {waitOff();});
					
				}, function(e) {
					console.log('error leyendo carrito:'+e);
					waitOff();
				});
			
			} catch (e) {console.log('error cargando lista carrito:'+e)}
		}
	}
	
	if (HAS_USER === true) {
		cargarListaCarrito();
	}
	
	$('.carrito_guardar_remoto').click(function() {
		//Debe capturar los atributos de cada elemento de la lista
		var lista = $('#listaCarrito');
		if (lista === undefined) {console.log('No se encontro #listaCarrito');return;}
		waitOn();
		leerCarritoLocal(function(data) {
			try {
				var errores = 0;
				lista.children().each(function(idx, itm) {
					var item = $(itm);
					var about = item.attr('about');
					var tipo = item.attr('typeof');
					var id = tipo+'/'+about;
					
					if (!(id in data)) {data[id] = {};}
					
					var codigos = capturarFormulario(item, data[id]);
					
					for (var i=0; i< codigos.length; i++) {
						var codigo = codigos[i];
						if (codigo.error != 0) {
							mostrarMensaje(item, codigo.msg, 'error');
							errores++;
						}
					}
				});
				
				if (errores > 0) {
					waitOff();
					return;
				}
				
				escribirCarritoLocal(data);
				escribirCarritoRemoto(data, function() {waitOff();}, function(e) {console.log('error guardando carrito:'+e);waitOff();});
			} catch (e) {
				console.log('error procesando elementos de carrito:'+e);
			}
		}, function(e) {
			console.log('error leyendo carrito:'+e);
			waitOff();
		});
	});
	
	/**
	 * <a data-producto class="button">Agregar a carrito</a>
	 */
	$('[data-producto]').each(function(i, elem) {
		var self = $(this);
		var papa = self.closest('[about]');
		if (!papa) {return;}
		
		var tipo = papa.attr('typeof');
		var about = papa.attr('about');
		
		if (tipo === undefined || tipo.length == 0) {
			tipo = '';
		}
		
		self.on('click', function() {
			agregarACarrito(tipo+'/'+about);
		});
	});
	
	$('[data-lenguaje]').each(function(i, elem){
		var self = $(this);
		var lenguaje = self.attr('data-lenguaje');
		
		self.on('click', function() {
			var matchCampo = /(http)(s?)(:)(\/\/)(.*?)(\/)((leng-)(.*?)(\/))?(.*)/g.exec(window.location);
			if (matchCampo) {
				var nuevo = '';
				var primeravez = true;
				var actual = matchCampo[9];
				var es_predeterminado = (lenguaje === LENGUAJE_PRED);
				for (var i=1; i<matchCampo.length; i++) {
					var temp = matchCampo[i];
					if (i <= 6 || i >= 11) {
						if (temp !== undefined) {
							nuevo += temp;
						}
					} else {
						if (es_predeterminado) {
							if (actual === undefined) {
								return;
							}
						} else {
							if (actual === lenguaje) {
								return;
							}
						}
						if (!es_predeterminado && primeravez) {
							nuevo += 'leng-'+lenguaje+'/';
							primeravez = false;
						}
					}
				}
				window.location = nuevo;
			}
		});
	});
	
	//Countdown
	//<script src="/assets/js/comun/jquery.countdown.min.js"></script>
	//<div dateProperty="regresivo" data-value="{% buscar leng dicci tipo nodo 'regresivo' '1480809600' %}"><h1 class="mycountdown" data-format="yyyy/MM/dd" data-count-format="%D d&iacute;as %H:%M:%S"></h1></div>
	$('.mycountdown').each(function(i, obj) {
		var self = $(obj);
		var inicio = self.text();
		var formato = self.attr('data-count-format');
		self.countdown(inicio, function(event) {
         $(this).text(event.strftime(formato));
		});
	});
	
	
	
})(jQuery);
