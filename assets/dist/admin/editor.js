
$(document).ready(function() {
	//Se habilitan los paneles splitters
    $('#paginaCompleta').enhsplitter({minSize: 0, vertical: false, position: 0});
    $('#totalArchivos').enhsplitter({minSize: 60, position: 350});
    
    //Se habilita el módulo de árbol de archivos y el editor de texto
    moduloArbolArchivos($('#contenedorArchivos'), $('editorTexto'));
});