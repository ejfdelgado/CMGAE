
//Leer https://www.jstree.com/plugins/
if (!hayValor(moduloArbolArchivos)) {
var moduloArbolArchivos = (function(elem, elemEditor) {
	
	var instanciaEditorTexto = moduloEditorTexto(elemEditor);
	
	var darNombresHijos = function(nodo) {
		var hijos = copiarJSON(leerObj(nodo, 'children', []));
		for (let i=0; i<hijos.length; i++) {
			hijos[i] = moduloArchivos.darNombreId(hijos[i]);
		}
		return hijos;
	};
	
	elem.on("changed.jstree", function (event, data) {
		if(data.selected.length) {
			var ref = data.instance.get_node(data.selected[0]);
		}
	});
	
	elem.bind("move_node.jstree", function (e, data) {
		console.log(data);
	});
    
	elem.on("rename_node.jstree", function (event, data) {
		var anterior = data.old;
		var nuevo = data.text;
		var elNodo = data.node;
		var refArbol = data.instance;
		
		if (elNodo.original.type == 'folder') {
			data.instance.set_id(elNodo, data.node.parent + nuevo + '/');
		} else {
			var viejoId = data.node.parent + anterior;
			var nuevoId = data.node.parent + nuevo;
			
			var funError = function() {
				elNodo.text = anterior;
				elNodo.original.text = anterior;
				refArbol.redraw([elNodo]);
				moduloMenus.error();
			};
			
			//Validar que otro no se llame igual
        	var padre = refArbol.get_node(data.node.parent);
        	var hermanos = darNombresHijos(padre);
        	if (estaEnLista(nuevo, hermanos)) {
        		funError();
        	} else {
				var promesa = moduloArchivos.renombrar(viejoId, nuevoId);
				$.when(promesa).then(function(datos) {
					if (datos.error != 0) {
						funError();
					} else {
						data.instance.set_id(elNodo, nuevoId);
					}
				}, funError);
        	}
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
            	}, moduloMenus.error);
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
            "label": "Nuevo archivo",
            "action": function(data) {
            	var nuevoNodo = {'text':'nuevo', 'type':'file'};
                var inst = $.jstree.reference(data.reference),
                obj = inst.get_node(data.reference);
                nuevoNodo.id = obj.id+nuevoNodo.text;
                let promesaEscritura = moduloArchivos.escribirTextoPlano(nuevoNodo.id, '');
				$.when(promesaEscritura).then(function() {
	                inst.create_node(obj, nuevoNodo, "last", function (new_node) {
	                    //new_node.data = {file: true};
	                    setTimeout(function () { inst.edit(new_node); },0);
	                });
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
            "action": function(data) {
            	var promesaConf = moduloMenus.confirmar();
            	$.when(promesaConf).then(function() {
		        	var inst = $.jstree.reference(data.reference),
		        	obj = inst.get_node(data.reference);
	            	var promesa = moduloArchivos.borrar(obj.id);
	            	$.when(promesa).then(function(respuesta) {
	            		if (respuesta.error == 0) {
		            		var inst = $.jstree.reference(data.reference);
		                	inst.delete_node($node);
	            		} else {
	            			moduloMenus.error();
	            		}
	            	}, moduloMenus.error);
            	});
            }
        };
		
		var cargar = {
	        "separator_before": false,
	        "separator_after": false,
	        "label": "Subir",
	        "action": function(data) {
	        	var inst = $.jstree.reference(data.reference);
	        	var obj = inst.get_node(data.reference);
	        	var rutaDestino = quitarUltimoSlash(obj.id);
	        	var hijos = darNombresHijos(obj);
	        	var promesa = moduloArchivos.subirArchivo({
	        		auto: 'false', 
	        		tipos:'audio/*|video/*|image/*|text/*', 
	        		opcionesNegras: hijos,
	        		dataFolder:rutaDestino,
	        	});
	        	$.when(promesa).then(function(resultado) {
	        		var nombreArchivo = moduloArchivos.darNombreId(resultado.id);
	        		if (!estaEnLista(nombreArchivo, hijos)) {
		        		var nuevoNodo = {
		        				'text': nombreArchivo, 
		        				'type': 'file', 
		        				'id': moduloArchivos.normalizarId(resultado.id, false)
		        				};
		                inst.create_node(obj, nuevoNodo, "last", function (new_node) {
		                	
		                });
	        		}
	        	}, moduloMenus.error);
	        }
		};
		
		var copiarRuta = {
		        "separator_before": false,
		        "separator_after": false,
		        "label": "URL",
				"action": function(data) {
					var inst = $.jstree.reference(data.reference);
					var obj = inst.get_node(data.reference);
					var url = moduloArchivos.generarUrlDadoId(obj.id);
					if (urlContieneExtension(url, ['css'])) {
						url = '<link rel="stylesheet" href="'+url+'"/>';
					} else if (urlContieneExtension(url, ['js'])) {
						url = '<script src="'+url+'"></script>'
					}
					copiarEnPortapapeles(url);
				}
		};
		
		var copiarRutaLocal = {
		        "separator_before": false,
		        "separator_after": false,
		        "label": "URL Local",
				"action": function(data) {
					var inst = $.jstree.reference(data.reference);
					var obj = inst.get_node(data.reference);
					var url = moduloArchivos.generarUrlDadoId(obj.id, true);
					if (urlContieneExtension(url, ['css'])) {
						url = '<link rel="stylesheet" href="'+url+'"/>';
					} else if (urlContieneExtension(url, ['js'])) {
						url = '<script src="'+url+'"></script>'
					}
					copiarEnPortapapeles(url);
				}
		};
		
		//solo se deben poder mover archivos.
		if ($node.original.type == 'folder') {
	        return {
	            'CrearArchivo': crearArchivo,
	            'CrearCarpeta': crearCarpeta,
	            'Cargar': cargar,
	            "Borrar": borrar,//Solo si no tiene hijos
	        };
		} else if ($node.original.type == 'file') {
	        return {
	            'Abrir': abrir,
	            'copiarRuta': copiarRuta,
	            'copiarRutaLocal': copiarRutaLocal,
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
	    "state", "wholerow",
	  ]
	});
	
    $(document).keydown(function(e) {
        if (e.keyCode == 65 && e.ctrlKey) {
            moduloArchivos.crearBasico();
        }
    });
	
	return {}
});
}