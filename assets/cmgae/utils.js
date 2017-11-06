
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

var leerObj = function(obj, nombres, predef) {
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
	if (esFuncion(objetoActual)) {
		return objetoActual();
	}
	return objetoActual;
};
