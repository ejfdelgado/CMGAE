
var hayValor = function(valor) {
	return (valor != undefined && valor != null && (!(typeof valor == 'string') || valor.trim().length > 0));
};

var esFuncion = function(algo) {
	return (typeof algo == 'function')
};