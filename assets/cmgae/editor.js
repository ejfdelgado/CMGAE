  $(function () {
	
	 var detectorCambios = (function() {
		 var actual = null;
		 var tomarImagen = function() {
			 
		 }
		 
		 return {
			 tomarImagen: tomarImagen,
		 }
	 })();
	  
	var destruirEditor = function() {
		$('editorTexto').empty();
		var nuevo = $('<div/>', { id: 'pluginEditor'});
		$('editorTexto').append(nuevo);
	};
	  
	var activarEditor = function(nombre, contenido, id) {
		var mapaTipos = [
		    {'patron': /.*\.js/ig, 'editor': 'ace/mode/javascript'},
		    {'patron': /.*\.html/ig, 'editor': 'ace/mode/html'},
		    {'patron': /.*\.json/ig, 'editor': 'ace/mode/json'},
		    {'patron': /.*\.css/ig, 'editor': 'ace/mode/css'},
		    {'patron': /.*\.xml/ig, 'editor': 'ace/mode/xml'},
		];
		destruirEditor();
	    var editor = ace.edit("pluginEditor");
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
		console.log('guardarArchivo', id);
		var editor = ace.edit("pluginEditor");
		var blobAttrs = { type: "text/plain"};
		var file = new File([editor.getValue()], id, blobAttrs);
		var form = new FormData();
        form.append('file-0', file);
        form.append('auto', 'false');
        form.append('name', id);
        $.ajax({
            url: '/storage/',
            type: 'POST',
            data: form,
            headers:{
            	'X-CSRFToken':$('[name="csrfmiddlewaretoken"]').val()
            },
            cache: false,
            contentType: false,
            processData: false,
        }).done(function(data) {
        	if (data.error != 0) {
        		alert('Error subiendo el archivo');
        	} else {
        		alert('Guardado exitósamente');
        	}
        }).fail(function() {
        	alert('Error subiendo el archivo');
        }).always(function() {
        	
        });
	}
	
	var cargarArchivo = function(id, callback) {
        $.ajax({
            url: '/storage/read?name='+encodeURIComponent(id),
            type: 'GET',
            cache: false,
            contentType: false,
            processData: false,
        }).done(function(data) {
        	callback(data);
        }).fail(function() {
        	alert('Error leyendo contenido');
        }).always(function() {
        	
        });
	};
	  
    $('#paginaCompleta').enhsplitter({minSize: 60, vertical: false, position: 60});
    $('#totalArchivos').enhsplitter({minSize: 60, position: 350});
    
	//Leer https://ace.c9.io/build/kitchen-sink.html
    //Leer https://www.jstree.com/plugins/
    $('#contenedorArchivos').on("changed.jstree", function (e, data) {
		if(data.selected.length) {
			var ref = data.instance.get_node(data.selected[0]);
		}
	});
    
    $('#contenedorArchivos').on("rename_node.jstree", function (e, data) {
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
    
	$('#contenedorArchivos').jstree({
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
		  "types" : {
		    "#" : {
		      //"max_children" : 1,
		      //"max_depth" : 4,
		      "valid_children" : ["root", "file", "folder"]
		    },
		    "root" : {
		      //"icon" : "/static/3.3.4/assets/images/tree_icon.png",
		      "valid_children" : ["default", "file", "folder"]
		    },
		    "default" : {
		      "valid_children" : ["default","file", "folder"]
		    },
		    "file" : {
		      "icon" : "/assets/js/jstree/themes/default/file.png",
		      "valid_children" : []
		    },
		    "folder" : {
		      "valid_children" : ["default", "file", "folder"]
		    }
		  },
		  'contextmenu': {
		        'items': function($node) {
		            return {
		                'Abrir': {
		                    "separator_before": false,
		                    "separator_after": false,
		                    "label": "Abrir",
		                    "action": function(data) {
		                    	destruirEditor();
		                    	var inst = $.jstree.reference(data.reference);
		                    	var ref = inst.get_node(data.reference);
		                    	cargarArchivo(ref.id, function(contenido) {
		                    		//TODO detectar que es error de que no existe, diferente a otro error
		                    		if (typeof(contenido) != 'string') {
		                    			contenido = '';
		                    		}
		                    		activarEditor(ref.text, contenido, ref.id);
		                    	});
		                    }
		                },
		                'Create': {
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
		                },
		                'CreateFile': {
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
		                },
		                'Rename': {
		                    "separator_before": false,
		                    "separator_after": false,
		                    "label": "Renombrar",
		                    "action": function(obj) {
		                    	var inst = $.jstree.reference(obj.reference);
		                    	inst.edit($node);
		                    }

		                },
		                "Remove": {
		                    "separator_before": false,
		                    "separator_after": false,
		                    "label": "Borrar",
		                    "action": function(obj) {
		                    	console.log('borrar');
		                    	var inst = $.jstree.reference(obj.reference);
		                    	inst.delete_node($node);
		                    }
		                }
		            };
		        }
		    },
		  "plugins" : [
		    "contextmenu", "dnd", "search","json_data",
		    "state", "wholerow"//, "types"
		  ]
		});
  });