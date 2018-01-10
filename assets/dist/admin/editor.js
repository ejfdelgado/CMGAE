
$(document).ready(function() {
	var modArbArch = null;
	
	//Se habilitan los paneles splitters
    $('#paginaCompleta').enhsplitter({minSize: 0, vertical: false, position: 0});
    $('#totalArchivos').enhsplitter({minSize: 60, position: 350, onDragEnd: function() {
    	modArbArch.actualizarAlturaTabsNav();
    }});
    
    //Se habilita el módulo de árbol de archivos y el editor de texto
    modArbArch = moduloArbolArchivos($('#contenedorArchivos'), $('editorTexto'));
});