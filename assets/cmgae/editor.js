  $(function () {
	
	var destruirEditor = function() {
		$('editorTexto').empty();
		var nuevo = $('<div/>', { id: 'pluginEditor'});
		$('editorTexto').append(nuevo);
	};
	  
	var activarEditor = function(nombre, contenido) {
		var mapaTipos = [
		    {'patron': /.*\.js/ig, 'editor': 'ace/mode/javascript'},
		    {'patron': /.*\.html/ig, 'editor': 'ace/mode/html'},
		];
		destruirEditor();
	    var editor = ace.edit("pluginEditor");
	    editor.setValue(contenido);
	    editor.setTheme("ace/theme/monokai");
	    for (let i=0; i<mapaTipos.length; i++) {
	    	let unTipo = mapaTipos[i];
	    	if (unTipo.patron.test(nombre)) {
	    		editor.getSession().setMode(unTipo.editor);
	    	}
	    }
	};
	
	var guardarArchivo = function(id) {
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
        		console.log('ok');
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
		      "max_children" : 1,
		      "max_depth" : 4,
		      "valid_children" : ["root"]
		    },
		    "root" : {
		      //"icon" : "/static/3.3.4/assets/images/tree_icon.png",
		      "valid_children" : ["default"]
		    },
		    "default" : {
		      "valid_children" : ["default","file"]
		    },
		    "file" : {
		      "icon" : "/assets/js/jstree/themes/default/file.png",
		      "valid_children" : []
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
		                    		activarEditor(ref.text, contenido);
		                    	});
		                    }
		                },
		                'Guardar': {
		                    "separator_before": false,
		                    "separator_after": false,
		                    "label": "Guardar",
		                    "action": function(data) {
		                    	var inst = $.jstree.reference(data.reference);
		                    	var ref = inst.get_node(data.reference);
		                    	guardarArchivo(ref.id);
		                    }
		                },
		                'Create': {
		                    "separator_before": false,
		                    "separator_after": false,
		                    "label": "Crear",
		                    "action": function(data) {
		                    	/*
	                            var inst = $.jstree.reference(data.reference),
                                obj = inst.get_node(data.reference);
		                        inst.create_node(obj, {}, "last", function (new_node) {
		                            new_node.data = {file: true};
		                            setTimeout(function () { inst.edit(new_node); },0);
		                        });
		                        */
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
		    "state", "types", "wholerow"
		  ]
		});
  });