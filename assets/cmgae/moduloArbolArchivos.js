
//Leer https://www.jstree.com/plugins/
var moduloArbolArchivos = (function(elem, elemEditor) {
	
	var instanciaEditorTexto = moduloEditorTexto(elemEditor);
	
	elem.on("changed.jstree", function (event, data) {
		if(data.selected.length) {
			var ref = data.instance.get_node(data.selected[0]);
		}
	});
    
	elem.on("rename_node.jstree", function (event, data) {
		var anterior = data.old;
		var nuevo = data.text;
		var elNodo = data.node;
		//TODO En el servidor actualizar la ruta y luego actualizar el id
		if (elNodo.original.type == 'folder') {
			data.instance.set_id(elNodo, data.node.parent + nuevo + '/');
		} else {
			data.instance.set_id(elNodo, data.node.parent + nuevo);
		}
	});
	
	elem.on("load_node.jstree", function(event, data) {
        var refArbol = data.instance;
        //Se itera sobre los hijos buscando los nodos que son type file
        for (let i=0; i<data.node.children.length; i++) {
        	let elId = data.node.children[i];
        	let unNodo = refArbol.get_node(elId);
        	ajustarAspectoNodo(unNodo);
        }
    });
	
	
	elem.on("create_node.jstree", function(event, data) {
		ajustarAspectoNodo(data.node);
	});
	
	var ajustarAspectoNodo = function(unNodo) {
		if (unNodo.original.type == 'file') {
    		elem.jstree(true).set_icon(unNodo.id, "/assets/js/jstree/themes/default/file.png");
    	}
	};
	
	var menuALaMedida = function($node) {
		var abrir = {
            "separator_before": false,
            "separator_after": false,
            "label": "Abrir",
            "action": function(data) {
            	instanciaEditorTexto.destruirEditor();
            	var inst = $.jstree.reference(data.reference);
            	var ref = inst.get_node(data.reference);
            	var promesaCargue = moduloArchivos.leerTextoPlano(ref.id);
            	$.when(promesaCargue).then(function(contenido) {
            		//TODO detectar que es error de que no existe, diferente a otro error
            		if (typeof(contenido) != 'string') {
            			contenido = '';
            		}
            		instanciaEditorTexto.abrirEditor(ref.text, contenido, ref.id);
            	});
            }
        };
		var crearCarpeta = {
            "separator_before": false,
            "separator_after": false,
            "label": "Crear carpeta",
            "action": function(data) {
            	var nuevoNodo = {'text':'nuevo', 'type':'folder'};
                var inst = $.jstree.reference(data.reference),
                obj = inst.get_node(data.reference);
                inst.create_node(obj, nuevoNodo, "last", function (new_node) {
                    //new_node.data = {file: true};
                    setTimeout(function () { inst.edit(new_node); },0);
                });
            }
        };
		
		var crearArchivo = {
            "separator_before": false,
            "separator_after": false,
            "label": "Crear archivo",
            "action": function(data) {
            	var nuevoNodo = {'text':'nuevo', 'type':'file'};
                var inst = $.jstree.reference(data.reference),
                obj = inst.get_node(data.reference);
                inst.create_node(obj, nuevoNodo, "last", function (new_node) {
                    //new_node.data = {file: true};
                    setTimeout(function () { inst.edit(new_node); },0);
                });
            }
        };
		
		var renombrar = {
            "separator_before": false,
            "separator_after": false,
            "label": "Renombrar",
            "action": function(obj) {
            	var inst = $.jstree.reference(obj.reference);
            	inst.edit($node);
            }
        };
		
		var borrar = {
            "separator_before": false,
            "separator_after": false,
            "label": "Borrar",
            "action": function(obj) {
            	console.log('borrar');
            	var inst = $.jstree.reference(obj.reference);
            	inst.delete_node($node);
            }
        };
		
		//solo se deben poder mover archivos.
		if ($node.original.type == 'folder') {
	        return {
	            'CrearArchivo': crearArchivo,
	            'CrearCarpeta': crearCarpeta,
	            "Borrar": borrar,//Solo si no tiene hijos
	        };
		} else if ($node.original.type == 'file') {
	        return {
	            'Abrir': abrir,
	            'Renombrar': renombrar,
	            "Borrar": borrar,
	        };
		}
    };
    
	elem.jstree({
	  "core" : {
	    "check_callback" : true,
	    "themes" : { "stripes" : true },
        'data': {
            'url': function (node) {
            	return "/storage/jstreelist";
             },
             'dataType': "json",
			 "data" : function (node) {
				return { "id" : node.id };
			 }
           }
	    
	  },
	  'contextmenu': {
	        'items': menuALaMedida,
	    },
	  "plugins" : [
	    "contextmenu", "dnd", "search","json_data",
	    "state", "wholerow"
	  ]
	});
	
	return {}
});