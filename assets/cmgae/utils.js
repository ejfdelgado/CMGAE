
var hayValor = function(valor) {
	return (valor != undefined && valor != null && (!(typeof valor == 'string') || valor.trim().length > 0));
};

var esFuncion = function(algo) {
	return (typeof algo == 'function')
};

var esNumero = function(dato) {
	return (typeof dato == 'number' || /^\d+$/.test(dato));
};

var esBoolean = function(variable) {
	return (typeof(variable) === "boolean");
}

var esObjeto = function(value) {
	return (typeof value == 'object' && value !== null);
};

var esLista = function(value) {
	return (hayValor(value) && value instanceof Array);
};

var estaEnLista = function(valor, lista) {
	if (!esLista(lista)){return false;}
	return (lista.indexOf(valor) >= 0);
};

var copiarJSON = function(dato) {
	return JSON.parse(JSON.stringify(dato));
};

var esMultilenguaje = function(entrada) {
	return /^(\S)+(\.\S+)+$/gim.test(entrada)
};

function darNumeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function decimalAHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return hex;
};

var darHtmlCompleto = function(elem) {
	return $('<div>').append(elem.clone()).html();
};

var darColorAleatorio = function(min, max) {
  if (!esNumero(min)) {min = 0;}
  if (!esNumero(max)) {max = 255;}
  if (min<0){min=0;}
  if (max>255){max=255;}
  var color = '#';
  for (var i = 0; i < 3; i++) {
    color += decimalAHex(darNumeroAleatorio(min, max));
  }
  return color;
};

var quitarUltimoSlash = function(rutaDestino) {
	rutaDestino = rutaDestino.trim();
	if (rutaDestino.endsWith('/')) {
		rutaDestino = rutaDestino.substring(0, rutaDestino.length-1);
	}
	return rutaDestino;
}

var leerObj = function(obj, nombres, predef, evitarInvocar) {
	if (!hayValor(nombres) || !esObjeto(obj)){return predef;}
	var partes = nombres.split('.');
	var objetoActual = obj;
	for (let i=0; i<partes.length; i++) {
		var llave = partes[i];
		if (esNumero(llave) && esLista(objetoActual)) {
			llave = parseInt(llave);
		}
		objetoActual = objetoActual[llave];
		if (i != (partes.length - 1) && !esObjeto(objetoActual)) {
			return predef;
		}
	}
	if (!hayValor(objetoActual)) {
		return predef;
	}
	if (evitarInvocar !== true && esFuncion(objetoActual)) {
		return objetoActual();
	}
	return objetoActual;
};

var asignarObj = function(raiz, nombres, valor) {
	var partes = nombres.split('.');
	var objetoActual = raiz;
	for (var i=0; i<partes.length; i++) {
		var llave = partes[i];
		if (esNumero(llave)) {
			llave = parseInt(llave);
		}
		if (esObjeto(objetoActual)) {
			if (i == (partes.length-1)) {
				if (esLista(objetoActual[llave]) && esLista(valor) && objetoActual[llave] !== valor) {
					objetoActual[llave].splice(0, objetoActual[llave].length);
					$.each(valor, function(i, eee) {
						objetoActual[llave].push(eee);
					});
				} else {
					objetoActual[llave] = valor;
				}
			} else {
				if (Object.keys(objetoActual).indexOf(''+llave) < 0 || (objetoActual[llave] == null)) {
					if (esNumero(partes[i+1])) {
						objetoActual[llave] = [];
					} else {
						objetoActual[llave] = {};
					}
				}
				objetoActual = objetoActual[llave];
			}
		}
	}
};

var darRutasObjeto = function(objOr, filtroObjetoAgregar) {
  var ans = [];
  var funcionRecursiva = function(obj, rutaActual) {
    if (esObjeto(obj)) {
      $.each(obj, function(llave, valor) {
        var llaveSiguiente = null;
        if (rutaActual === null) {
          llaveSiguiente = llave;
        } else {
          llaveSiguiente = rutaActual+'.'+llave;
        }
        if (esFuncion(filtroObjetoAgregar) && filtroObjetoAgregar(valor)) {
          ans.push(llaveSiguiente);
        }
        funcionRecursiva(valor, llaveSiguiente);
      });
    } else {
      if (rutaActual !== null) {
        if (esFuncion(filtroObjetoAgregar)) {
          if (filtroObjetoAgregar(obj)) {
            ans.push(rutaActual);
          }
        } else {
          ans.push(rutaActual);
        }
      }
    }
  };

  funcionRecursiva(objOr, null);
  return ans;
};

var predefinir = function(objeto, ejemplo) {
	var llaves = darRutasObjeto(ejemplo);
	for (let i=0; i<llaves.length; i++) {
		let llave = llaves[i];
		if (!hayValor(leerObj(objeto, llave, null, true))) {
			let nuevo = leerObj(ejemplo, llave, null, true);
			asignarObj(objeto, llave, nuevo);
		}
	}
	return objeto;
};

/*
Función que facilita la configuración de listas de datos con Midgard
La configuración de listas es algo como:
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
var configurarListasEditor = function (vie, configuracionListas) {
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

var tieneAtributo = function(elem, name) {
	var attr = elem.attr(name);
	return (typeof attr !== typeof undefined && attr !== false)
};

var activarConteoRegresivo = function() {
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
};

var jsonToHtml = function(val) {
	return JSON.stringify(val, null, 4).replace('\n', '<br/>');
};
