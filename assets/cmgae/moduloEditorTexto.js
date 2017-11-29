//Leer https://ace.c9.io/build/kitchen-sink.html
if (!hayValor(moduloEditorTexto)) {
var moduloEditorTexto = (function(ele) {
	var idLocal = 'pluginEditor';
	var destruirEditor = function() {
		ele.empty();
		var nuevo = $('<div/>', {id: idLocal});
		ele.append(nuevo);
	};
	  
	var abrirEditor = function(nombre, contenido, id) {
		var mapaTipos = [
		    {'patron': /.*\.js/ig, 'editor': 'ace/mode/javascript'},
		    {'patron': /.*\.html/ig, 'editor': 'ace/mode/html'},
		    {'patron': /.*\.json/ig, 'editor': 'ace/mode/json'},
		    {'patron': /.*\.css/ig, 'editor': 'ace/mode/css'},
		    {'patron': /.*\.scss/ig, 'editor': 'ace/mode/scss'},
		    {'patron': /.*\.xml/ig, 'editor': 'ace/mode/xml'},
		];
		destruirEditor();
	    var editor = ace.edit(idLocal);
	    editor.setValue(contenido);
	    editor.setTheme("ace/theme/monokai");
	    editor.commands.addCommand({
	        name: 'comandoGuardar',
	        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
	        exec: function(editor) {
            	guardarArchivo(id);
	        },
	        readOnly: true // false if this command should not apply in readOnly mode
	    });
	    for (let i=0; i<mapaTipos.length; i++) {
	    	let unTipo = mapaTipos[i];
	    	if (unTipo.patron.test(nombre)) {
	    		editor.getSession().setMode(unTipo.editor);
	    	}
	    }
	};
	
	var guardarArchivo = function(id) {
		var editor = ace.edit(idLocal);
		var promesasTodas = moduloArchivos.borrarCacheConId(id);
		promesasTodas['guardado'] = moduloArchivos.escribirTextoPlano(id, editor.getValue()); 
		$.when(promesasTodas).then(function() {
			alert('Archivo guardado!');
		}, function() {
			alert('Error subiendo el archivo');
		});
	};
	
	return {
		abrirEditor: abrirEditor,
		destruirEditor: destruirEditor,
	};
});
}
