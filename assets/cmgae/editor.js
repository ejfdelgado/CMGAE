  $(function () {
	
	var activarEditor = function(nombre, contenido) {
		var mapaTipos = [
		    {'patron': /.*\.js/ig, 'editor': 'ace/mode/javascript'},
		    {'patron': /.*\.html/ig, 'editor': 'ace/mode/html'},
		];
		$('editorTexto').empty();
		var nuevo = $('<div/>', { id: 'pluginEditor'});
		$('editorTexto').append(nuevo);
	    var editor = ace.edit("pluginEditor");
	    editor.setTheme("ace/theme/monokai");
	    for (let i=0; i<mapaTipos.length; i++) {
	    	let unTipo = mapaTipos[i];
	    	if (unTipo.patron.test(nombre)) {
	    		editor.getSession().setMode(unTipo.editor);
	    	}
	    }
		
	};
	  
    $('#paginaCompleta').enhsplitter({minSize: 60, vertical: false, position: 60});
    $('#totalArchivos').enhsplitter({minSize: 60, position: 350});
    
	//Leer https://ace.c9.io/build/kitchen-sink.html
    /*
	$('#contenedorArchivos').jstree({
		'core' : {
			'data' : [
				{ "text" : "Raíz", "children" : [
						{ "text" : "Child node 1" },
						{ "text" : "Child node 2" }
				]}
			]
		}
	});*/
	
	$('#contenedorArchivos').jstree({
		  "core" : {
		    "animation" : 0,
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
		      "icon" : "/static/3.3.4/assets/images/tree_icon.png",
		      "valid_children" : ["default"]
		    },
		    "default" : {
		      "valid_children" : ["default","file"]
		    },
		    "file" : {
		      "icon" : "glyphicon glyphicon-file",
		      "valid_children" : []
		    }
		  },
		  "plugins" : [
		    "contextmenu", "dnd", "search","json_data",
		    "state", "types", "wholerow"
		  ]
		});
	
	activarEditor('archivo.js', 'Mi contenido');
	  
    // 6 create an instance when the DOM is ready
	//Leer https://www.jstree.com/plugins/
	// html demo
	  
	  /*
	$('#html').jstree();

	// inline data demo


	// data format demo
	$('#frmt').jstree({
		'core' : {
			'data' : [
				{
					"text" : "Root node",
					"state" : { "opened" : true },
					"children" : [
						{
							"text" : "Child node 1",
							"state" : { "selected" : true },
							"icon" : "jstree-file"
						},
						{ "text" : "Child node 2", "state" : { "disabled" : true } }
					]
				}
			]
		}
	});

	// ajax demo
	$('#ajax').jstree({
		'core' : {
			'data' : {
				"url" : "/assets/cmgae/datos/root.json",
				"dataType" : "json" // needed only if you do not supply JSON headers
			}
		}
	});

	// data from callback
	$('#clbk').jstree({
		'core' : {
			'data' : function (node, cb) {
				if(node.id === "#") {
					cb([{"text" : "Root", "id" : "1", "children" : true}]);
				}
				else {
					cb(["Child"]);
				}
			}
		}
	});

	// interaction and events
	$('#evts_button').on("click", function () {
		var instance = $('#evts').jstree(true);
		instance.deselect_all();
		instance.select_node('1');
	});
	$('#evts')
		.on("changed.jstree", function (e, data) {
			if(data.selected.length) {
				alert('The selected node is: ' + data.instance.get_node(data.selected[0]).text);
			}
		})
		.jstree({
			'core' : {
				'multiple' : false,
				'data' : [
					{ "text" : "Root node", "children" : [
							{ "text" : "Child node 1", "id" : 1 },
							{ "text" : "Child node 2" }
					]}
				]
			}
		});
	

	*/
	
	
	/*

*/
	
	/*
    $('#jstree').jstree();
    // 7 bind to events triggered on the tree
    $('#jstree').on("changed.jstree", function (e, data) {
      console.log(data.selected);
    });
    // 8 interact with the tree - either way is OK
    $('button').on('click', function () {
      $('#jstree').jstree(true).select_node('child_node_1');
      $('#jstree').jstree('select_node', 'child_node_1');
      $.jstree.reference('#jstree').select_node('child_node_1');
    });
	*/
  });