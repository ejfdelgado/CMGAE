
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

var esMultilenguaje = function(entrada) {
	return /^(\S)+(\.\S+)+$/gim.test(entrada)
};

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
