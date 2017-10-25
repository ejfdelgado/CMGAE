
//TODO homologar con waitOn y waitOff
var actividad = (function() {
	var pendientes = 0;
	var actividadOn = function() {
		if (pendientes == 0) {
			$('body').append('<div id="loading"><p>Procesando petici&oacute;n...</p></div>');
		}
		pendientes++;
	};

	var actividadOff = function() {
		pendientes--;
		if (pendientes<=0) {
			pendientes = 0;
			$('#loading').remove();
		}
	};
	
	return {
		on: actividadOn,
		off: actividadOff,
	}
})();

var manejoPopUps = (function() {
	var mostrarMenuPagina = function() {
		pila.push('menu_pagina');
		$('.menu_core').toggleClass('invisible');
		$('.menu_pagina').toggleClass('invisible');
		window.scrollTo(0,0);
	};
	
	var mostrarFormularioEdicion = function(nodo, atributo, valor, sufijo) {
		console.log('mostrarFormularioEdicion', nodo, atributo, valor)
		$(".formhtml").attr('nodo2', nodo);
		$(".formhtml").attr('property2', atributo);
		$(".formhtml").attr('sufijo', sufijo);
		$('.formhtml textarea').val(valor);
		$('.formhtml').removeClass('invisible');
		pila.push("formhtml");
	};
	
	return {
		'mostrarMenuPagina': mostrarMenuPagina,
		'mostrarFormularioEdicion': mostrarFormularioEdicion,
	};
})();

(function($) {
	var MAX_FILE_SIZE = 500*1024;//en KB
	var vie = getVieHere();
	
	var hayValor = function(valor) {
		return (valor != undefined && valor != null && (!(typeof valor == 'string') || valor.trim().length > 0));
	};
	
	  var funcionAsignarPropiedadDeNodo = function(vie, nomNodo, nomProp, nuevo, sufijo) {
		  var sql = "[about='"+nomNodo+"'] [property='"+nomProp+"']";
		  var sql2 = "[about='"+nomNodo+"'] [styleProperty='"+nomProp+"'],[about='"+nomNodo+"'][styleProperty='"+nomProp+"']";
		  
		  if (!hayValor(sufijo)) {
			  sufijo = '';
		  }
		  
		  var notificarCambio = function() {
			  var dato = {};
	      	  dato[nomProp+sufijo] = nuevo;
			  var modelo = vie.entities.get(nomNodo);
			  modelo.set(dato);
			  
			  //para notificar a createjs que cambio
			  var cambiados = $('body').data('Midgard-midgardStorage').changedModels;
			  if (_.indexOf(cambiados, modelo) === -1) {
				  cambiados.push(modelo);
			  }
			  $('#midgardcreate-save').button({disabled: false});
		  };
		  
		  var objeto = $(sql);
		  var objeto2 = $(sql2);
		  if (objeto.length > 0) {
			  var nombreTag = objeto.prop("tagName");
			  if (nombreTag == 'IMG') {
				  if (sufijo == '_alt') {
					  objeto.attr( "alt", nuevo );
				  } else {
					  objeto.attr( "src", nuevo );
				  }
			  }
			  notificarCambio();
		  } else if (objeto2.length > 0) {
			  nuevo = nuevo.replace(/"/g, '&quot;');
			  objeto2.attr('style', nuevo);
			  notificarCambio();
			  //objeto.html(nuevo);//TODO esto dónde va??
		  }
	  };
	
	//Se agrega el elemento que permitira subir archivos
	$( "body" ).append( $( "<input type='file' id=\"formularioImagenes\" class=\"fileEscondido\" nodo2=\"\" property2=\"\" />" ) );
	
	//Se agrega el elemento que permite editar html
	$( "body" ).append($(
		'<div class="formhtml invisible">'+
		'	<div class="ctrles"><a class="guardar">Guardar</a>&nbsp;<a class="cancelar">Cancelar</a></div>'+
		'	<div class="boxtexto">'+
		'	<textarea></textarea>'+
		'	</div>'+
		'</div>'
	));
	
	function activarEstilosEditables(objeto) {
		objeto.find('[styleProperty]').each(function (index, element) {
			var self = $(element);
			if(self.attr("act_style") !== "ok") {
				var propiedad = self.attr('styleProperty');
				var padre;
				if (self.attr('about') !== undefined) {
					padre = self; 
				} else {
					padre = self.closest('[about]');
				}
				if (padre === undefined) { return; }

				self.on("click", function(e) {
					if (e.shiftKey) {
						//Se permite editar el estilo
						let valorAnterior = self.attr('style');
						manejoPopUps.mostrarFormularioEdicion(padre.attr('about'), propiedad, valorAnterior);
					} else if (e.ctrlKey) {
						//Se permtie diréctamente actualizar el fondo
						abrirFileChooser(self, propiedad);
					}
				});
				
				self.attr("act_style", "ok");
			}
		});
	};
	
	activarEstilosEditables($('body'));	
	
	//------------------imagenes---------------------
	var comunEdicionImagenes = function(self, propEstilo) {
		var respuesta = {
		  ok: false,
		};
		if ($('#midgardcreate-save').css('display') === 'none') {return respuesta;}
		
		if (self.attr('about') !== undefined) {
			respuesta.padre = self;
		} else {
			respuesta.padre = self.closest('[about]');
		}
		
		if (respuesta.padre === undefined) {return respuesta;}
		
		respuesta.ident = respuesta.padre.attr('about');
		if (hayValor(propEstilo)) {
			respuesta.propiedad = propEstilo;
		} else {
			respuesta.propiedad = self.attr('property');
		}
		if (respuesta.ident === undefined || respuesta.propiedad === undefined) {return respuesta;}
		respuesta.ok = true;
		return respuesta;
	};
	
	var abrirAltEditor = function(self) {
		if (self.prop("tagName") !== 'IMG') {return;}
		var attrs = comunEdicionImagenes(self);
		if (attrs.ok == false) {return;}
		manejoPopUps.mostrarFormularioEdicion(attrs.ident, attrs.propiedad, self.attr('alt'), '_alt');
	}
	//Todas las imágenes podrán cambiar con click
	var abrirFileChooser = function(self, propEstilo) {
		var attrs = comunEdicionImagenes(self, propEstilo);
		if (attrs.ok == false) {return;}
		
		var patronFondo = /(background-image\s*:\s*url\s*\(\s*['"]?)([^'^"]*?)(\s*['"]?\))\s*(!\s*important)?\s*(;)?/ig;
		var asignarSrc = function(unId) {
			var valor = 'http://storage.googleapis.com'+unId+'?' + new Date().getTime();
			if (hayValor(propEstilo)) {
				//Se trata de una imagen de fondo
				let original = self.attr('style');
				original = original.replace(patronFondo, '');
				original = original.trim();
				if (hayValor(original) && !original.endsWith(';')) {
					original = original+';';
				}
				original+='background-image: url(\''+valor+'\') !important;';
				self.attr('style', original);
				return original;
			} else {
				self.attr('src', valor);
			}
			return valor;
		};
		var darIdAnterior = function() {
			var patronGoogleStorage = /^(https?:\/\/storage\.googleapis\.com)([^\?]*)(\?.*)?$/ig;
			var direccion = null;
			if (hayValor(propEstilo)) {
				let original = self.attr('style');
				let partesEstilo = patronFondo.exec(original);
				if (partesEstilo != null && partesEstilo.length > 3) {
					direccion = partesEstilo[2];
				}
			} else {
				direccion = self.attr('src');
			}
			if (!hayValor(direccion)) {return null;}
			var partes = patronGoogleStorage.exec(direccion);
			if (partes != null && partes.length >= 3) {
				return partes[2];
			}
			
			return null;
		};
		
		var maximoTamanio = MAX_FILE_SIZE;
		var dataFolder = '/imagenesbasico';
		//Se valida si el html declara un tamaño máximo específico
		try {
			var valorDataMax = self.attr('data-max');
			if (hayValor(valorDataMax)) {
				maximoTamanio = parseInt(valorDataMax)*1024;
			}
		} catch(e2) {
			console.log('Intentó determinar tamaño máximo de imagen pero falló');
		}
		//Se valida si el html declara una carpeta específica
		var attrDataFolder = self.attr('data-carpeta');
		if (typeof attrDataFolder !== typeof undefined && attrDataFolder !== false) {
			attrDataFolder = attrDataFolder.trim();
			if (hayValor(attrDataFolder)) {
				if (attrDataFolder.charAt(0)!='/') {
					attrDataFolder = '/'+attrDataFolder;
				}
				dataFolder += attrDataFolder;
			}
		}
		
		var temp = $('<input type="file" class="invisible" accept="image/*">');
		  temp.on("change", function (e) {
		        var file = e.target.files[0];
		        
		        if (file.size > maximoTamanio) {
		        	alert('Archivo muy grande! debe ser menor a '+(maximoTamanio/(1024))+'KB');
		        	return;
		        }
		        
		        var reader = new FileReader();
		        
		        reader.readAsDataURL(file);
		        
		        var form = new FormData();
		        form.append('file-0', file);
		        
		        form.append('folder', dataFolder);
		        
		        var nombreAnterior = darIdAnterior();
		        if (hayValor(nombreAnterior)) {
		        	form.append('name', nombreAnterior);
		        }
		        
		        actividad.on();
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
		        		alert('Error subiendo la imagen');
		        	} else {
		        		var valor = asignarSrc(data.id);
		        		funcionAsignarPropiedadDeNodo(vie, attrs.ident, attrs.propiedad, valor);
		        	}
		        }).fail(function() {
		        	alert('Error cargando imagen');
		        }).always(function() {
		        	actividad.off();
		        });
		    });
		  temp.click();
	  }
	  
		function activarImagenes(objeto) {
			objeto.find('img[property]').each(function (index, element) {
				var actual = $(element);
				if(actual.attr("act_img") !== "ok") {
					$(element).on('click', function(e) {
						var elemJq = $(element);
						if (e.altKey) {
							//Permite modificar el texto alternativo
							abrirAltEditor(elemJq)
						} else {
							//Permite modificar la imagen
							abrirFileChooser(elemJq);
						}
					});
					actual.attr("act_img", "ok");
				}
			});
		}
		activarImagenes($('body'));
		//------------------imagenes---------------------

		//------------------html editables---------------------
		function activarEditables(objeto) {
			objeto.find('.editable').each(function (index, element) {
				var actual = $(element);
				if(actual.attr("act_edt") !== "ok") {
					actual.on('click', function() {
						var padre = actual.closest('[about]');
						if (padre) {
							if ($('#midgardcreate-save').css('display') === 'none') {return;}
							manejoPopUps.mostrarFormularioEdicion(padre.attr('about'), actual.attr('property'), actual.html());
						}
					});
					actual.attr("act_edt", "ok");
					//Se intenta agregar un elemento que permita edición después de creación
					if (!actual.hasClass('textarea_background')) {//? TODO decidir se para los fondos se va a hacer así
						var nuevoBoton = $('<button type="button" style="padding: 5px !important;">editar</button>');
						nuevoBoton.bind('click', function() {
							actual.click();
						});
						actual.after(nuevoBoton);
					}
				}
			});
		}
		activarEditables($('body'));
		//------------------html editables---------------------
		
		function activarTextoPlano(objeto) {
			objeto.find('[textplain="true"]').each(function (index, element) {
				var actual = $(element);
				if(actual.attr("act_tpl") !== "ok") {
					actual.on('blur', function() {
						actual.html(actual.text());
					});
					actual.attr("act_tpl", "ok");
				}
			});
		}
		activarTextoPlano($('body'));
		
		
		//------------------html fechas---------------------
		function activarFechas(objeto) {
			objeto.find("[dateProperty]").each(function(index, element) {
				var actual = $(element);
				var nomPropiedad = actual.attr("dateProperty");
				if(actual.attr("act_date") !== "ok") {
					var padre = actual.closest('[about]');
					if (padre) {
						var valorViejo = formatearFecha(actual, 'dd/MM/yyyy');
						var nuevo = $('<input style="display: none;" class="datepicker" type="text" autofocuss value="'+valorViejo+'" data-valuee="'+valorViejo+'"></input>');
						padre.append(nuevo);
						//TODO verificar porque a veces no funciona
						actual.click(function() {
							nuevo.click();
							//nuevo.focus();
						});
						
						var nuevoProp = $('<div style="display: none;" property="'+nomPropiedad+'">'+actual.attr("data-value")+'</div>');
						padre.append(nuevoProp);
						
						nuevo.on('change', function() {
							var nomProp = nomPropiedad;
							var dato = {};
							
							var txtNueVal = "0";
							try {
								txtNueVal = parseInt((toDate(nuevo.val()).getTime())/1000);
							} catch (e) {}
							
							dato[nomProp] = txtNueVal;
							var modelo = vie.entities.get(padre.attr("about"));
							modelo.set(dato);
							  
							//para notificar a createjs que cambio
							var cambiados = $('body').data('Midgard-midgardStorage').changedModels;
							if (_.indexOf(cambiados, modelo) === -1) {
							  cambiados.push(modelo);
							}
							$('#midgardcreate-save').button({disabled: false});
							
							actual.attr("data-value", txtNueVal);
							nuevoProp.text(txtNueVal);
							formatearFecha(actual);
						});
						
						nuevo.pickadate({
							format: 'dd/mm/yyyy',
				            formatSubmit: 'dd/mm/yyyy',
				            closeOnSelect: true,
				            closeOnClear: true,
				            selectMonths: true,
				            selectYears: true
				        });
					}
					actual.attr("act_date", "ok");
				}
				
				
			});
		}
		activarFechas($('body'));
		//------------------html fechas---------------------
		
		//midgardeditableenable cuando una entidad es editable
		//midgardeditablechanged cuando la propiedad fue modificada
		//midgardeditableenableproperty al hacerse editable
		$('body').bind('midgardeditableenable',
			function(event, data) {
				var ident = data.entity['@subject'];
				var patronIdent = /(<)(.*)(>)/g;
				var matchIdent = patronIdent.exec(ident);
				if (matchIdent) {
					matchIdent = matchIdent[2];
				} else {
					matchIdent = ident;
				}
				
				var objeto = $("[about='"+matchIdent+"']");
				if (objeto !== undefined) {
					activarEstilosEditables(objeto);//debe ser antes que activarEditables
					activarImagenes(objeto);
					activarEditables(objeto);
					activarTextoPlano(objeto);
					activarFechas(objeto);
				}
			}
		);
     
	  // Instantiate Create
	  $('body').midgardCreate({
	    url: function() {
	      return 'javascript:false;';
	    },
	    vie: vie,
	    //toolbar: 'full',//full or minimized
	    highlight: false,
	    //state: 'edit',//browse or edit tiene problemas cuando muestra los controles de formato posibles
	    collectionWidgets: {
	    	'default': 'midgardCollectionAdd',
	      //'default': 'midgardCollectionAddBetween',
	      //'feature': 'midgardCollectionAdd'
	    },
	  });
	  
	  configureEditorsHere();
	  
	  var templatebotoneditar = "<div class='editableicon'></div>";
	  
	  $('.formhtml .cancelar').click(function() {
		  $('.formhtml').addClass('invisible');
		  if (pila[pila.length-1] === "formhtml") {pila.pop();}
	  });
	  
	  $('.formhtml .guardar').click(function() {
		  try {
			  var formulario = $('.formhtml');
			  var nomNodo = formulario.attr('nodo2');
			  var nomProp = formulario.attr('property2');
			  var sufijo = formulario.attr('sufijo');
			  var nuevo = $('.formhtml textarea').val();
			  funcionAsignarPropiedadDeNodo(vie, nomNodo, nomProp, nuevo, sufijo);
			  $('.formhtml').addClass('invisible');
			  if (pila[pila.length-1] === "formhtml") {pila.pop();}
		  } catch (e) {
			  $('body').data('Midgard-midgardNotifications').create({body: "Error "+e});
		  }
	  });
	  
	  $("#formularioImagenes").change( function readImage() {
		    if ( this.files && this.files[0] ) {
		        var FR = new FileReader();
		        FR.onload = function(e) {
		        	var formulario = $("#formularioImagenes");
		        	var nomNodo = formulario.attr('nodo2');
		        	var nomProp = formulario.attr('property2');
		        	var objeto = $("[about='"+nomNodo+"'] [property='"+nomProp+"']");
		        	var dato = {};
		        	dato[nomProp] = e.target.result;
		        	if (objeto) {
			        	if (objeto.prop("tagName") == 'IMG') {
			        		objeto.attr( "src", e.target.result );
			        	} else {
			        		//asigna la imagen en el estilo
			        		objeto.attr( "style", "background-image: url('"+e.target.result+"') !important");
			        	}
			        	
			        	var modelo = vie.entities.get(nomNodo);
			        	modelo.set(dato);
			        	
			        	//para notificar a createjs que cambio
						var cambiados = $('body').data('Midgard-midgardStorage').changedModels;
						if (_.indexOf(cambiados, modelo) === -1) {
							cambiados.push(modelo);
						}
						$('#midgardcreate-save').button({disabled: false});
		        	}
		        };       
		        FR.readAsDataURL( this.files[0] );
		    }
		} );
	  
	  $('textarea[property]').on('change keyup paste', function () {
		  self = $(this);
		  var propiedad = self.attr('property');
		  var padre = self.closest('[about]');
		  if (padre) {
			  let ident = padre.attr('about');
			  let valor = self.val();
			  
			  var dato = {};
	      	  dato[propiedad] = valor;
			  var modelo = vie.entities.get(ident);
			  modelo.set(dato);
			  
			  //para notificar a createjs que cambio
			  var cambiados = $('body').data('Midgard-midgardStorage').changedModels;
			  if (_.indexOf(cambiados, modelo) === -1) {
				  cambiados.push(modelo);
			  }
			  $('#midgardcreate-save').button({disabled: false});
		  }
	  });
})(jQuery);