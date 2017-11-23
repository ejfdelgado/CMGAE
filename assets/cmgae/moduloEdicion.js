
if (!hayValor(moduloEdicion)) {
var moduloEdicion = (function() {
	var mapaIds = {};
	var activarEdicionOk = false;
	var vie = null;
	
	var configureEditorsHere = function() {
		jQuery('body').midgardCreate('configureEditor', 'default', 'halloWidget', {
			plugins: {'halloformat': {},'halloblock': {},'hallolists': {},'hallolink': {},'halloreundo': {},}});

		jQuery('body').midgardCreate('configureEditor', 'plaintext', 'halloWidget', {
			plugins: {'halloreundo': {}}});

		jQuery('body').midgardCreate('setEditorForProperty', 'TextSimple', 'plaintext');

		jQuery('body').midgardCreate('configureEditor', 'nuevo', 'halloWidget', {
			plugins: {
				halloformat: {},
				halloblacklist: {
					tags: ['br']
				}
			}
		});
	};
	
	var activarEdicion = function() {
		if (activarEdicionOk == true){return;}
		if(typeof Backbone != 'undefined') {
			  Backbone.sync = function(method, model, options) {
				  try {
					  var temp = model.toJSON()
					  var viejo = temp['@subject'];
					  if (model.isNew()) {
						  if (viejo in mapaIds ) {
							  temp['@subject'] = mapaIds[viejo];
						  } else {
							  temp['@subject'] = '<' + new Date().getTime()+"_"+Math.floor((Math.random() * 10) + 1) + '>';
							  mapaIds[viejo] = temp['@subject'];
						  }
					  }
					  
					  var ident = temp['@subject'];
					  var tipo = temp['@type'];
					  
					  var matchCampo = /(viejs\.org\/ns\/)(.*)(>)/g.exec(tipo);
					  var tipoNombre = null;
					  if (matchCampo) {
						  tipoNombre = matchCampo[2];
					  }
					  
					  var patronIdent = /(<)(.*)(>)/g;
					  var matchIdent = patronIdent.exec(ident);
					  
					  if (matchIdent == null) {
						  options.error('error: no es identificador '+ident);
						  return;
					  }
					  
					  var matchIdentFinal = matchIdent[2];
					  var contenido = {};
					  
					  for (var key in temp) {
						  var matchCampo = /(viejs\.org\/ns\/)(.*)(>)/g.exec(key);
						  if (matchCampo) {
							  contenido[matchCampo[2]] = temp[key]
						  }
					  }
					  
					  var completo = {}
					  completo['payload'] = contenido;
					  completo['leng'] = LENGUAJE;
					  //completo['tipo'] = tipoNombre;
					  switch (method) {
					  case 'create':
					  case 'update':
						  moduloActividad.on();
						  $.ajax({
							  type: "POST",
							  url: "/rest/"+(tipoNombre === null || tipoNombre === undefined ? 'Documento' : tipoNombre)+"/"+matchIdentFinal,
							  data: JSON.stringify(completo),
							  headers: moduloHttp.darHeader(),
							  contentType: "application/json; charset=utf-8",
							})
							.done(function( msg ) {
								  options.success(model);
							})
							.fail(function( jqXHR, textStatus ) {
								options.error('error');
							})
							.always(function() {
								moduloActividad.off();
							});
						  break;
					  case 'delete':
						  break;
					  case 'read':
						  break;
					  }
				  } catch (e) {
					  options.error('error '+e);
				  }
			  };
			  activarEdicionOk = true;
		  }
	};
	
	var activarPaginacion = function(nodo) {
		if (!hayValor(nodo)) {
			nodo = $('body');
		}
		
		function activatePageA(actual) {
			var cursor = actual.attr('data-next');
			var busqueda = JSON.parse(actual.attr('data-q'));
			var template = actual.attr('data-tpl');
			var target = actual.attr('data-target');
			var ipage = parseInt(actual.attr('data-page'));
			
			if (!busqueda['n']) {
				busqueda['n'] = 100;//valor predeterminado en python def buscarGQL(objeto)
			}
			if (!moduloApp.esAdmin()) {
				actual.html((ipage*busqueda['n']+1)+" al "+((ipage+1)*busqueda['n']));
			}
			
			if (actual.attr("data-noa") === "1") {
				actual.removeAttr("href");
				actual.on('click', function() {

					var docHtml = document.getElementById(template).innerHTML;

					var destino = $(target);
					var postload = destino.attr('data-postload');
					if (destino.length > 0) {
						moduloActividad.on();
						$.ajax({
							type: "PUT",
							url: "/paginar/",
							data: JSON.stringify({busqueda:busqueda, cursor:cursor}),
							contentType: "application/json; charset=utf-8",
						})
						.done(function( msg ) {
							var datos = msg['datos'];
							var sigui = msg['next'];
							destino.empty();
							for (var i=0; i<datos.length; i++) {
								var dato = datos[i];
								var nuevo = $(docHtml);
								llenarTemplate(nuevo, dato);
								destino.append(nuevo);
							}
							//Se mira si se debe crear un boton de siguiente
							if (sigui !== undefined && sigui.length > 0) {
								var padrePaginacion = actual.closest('.paginacion');
								if (padrePaginacion.find("[data-next='"+sigui+"']").length == 0) {
									
									var padreLocal = actual.parent();
									var nombreTAG = padreLocal.prop("tagName");
									var cambio = false;
									while (padreLocal.get(0) != padrePaginacion.get(0) && nombreTAG != 'BODY') {
										cambio = true;
										actual = padreLocal;
										padreLocal = padreLocal.parent();
										nombreTAG = padreLocal.prop("tagName");
									}
									var paginaSigui = actual.clone();
									var paginaSigui2;
									if (cambio) {
										paginaSigui2 = paginaSigui.find('[data-next]');
									} else {
										paginaSigui2 = paginaSigui;
									}
									paginaSigui2.attr("data-page", ipage+1);
									paginaSigui2.attr("data-next", sigui);
									
									padrePaginacion.append(paginaSigui);
									activatePageA(paginaSigui2);
								}
							}
							
							if (postload !== undefined) {
								eval(postload);
							}
						})
						.fail(function( jqXHR, textStatus ) {
							moduloMenus.mostrarMenuSoloTexto('Error paginando');
						}).always(function() {
							moduloActividad.off();
						});
					}
				});
			}
		};
		
	  $.each(nodo.find("a[data-next]"), function(index, element) {
		var actual = $(element);
		activatePageA(actual);
	  });
	};
	
	  var funcElegirBorrar = function() {
		  var botones = $('.btnEliminar');
		  if (botones.length > 0) {
			  botones.remove();
		  } else {
			  $('[about]').each(function(indice, elem) {
				  var self = $(elem);
				  var panelEliminar = self.find('.btnEliminar');
				  if (panelEliminar.length == 0) {
					  self.prepend($('<div class="btnEliminar"><div class="btnEliminarX btnEliminar2 manito"></div></div>'));
					  panelEliminar = self.find('.btnEliminar');
					  let botonEliminar = panelEliminar.find('.btnEliminar2');
					  botonEliminar.click(function() {
						  var promesa = moduloMenus.confirmar();
						  $.when(promesa).then(function() {
							  var entidad = self;
							  var ident = entidad.attr('about');
							  var tipoNombre = null;
							  tipoNombre = entidad.attr('typeof');
							  
							  var miLlave = (!hayValor(tipoNombre) ? '' : tipoNombre)+'_'+ident;
							  if (miLlave in mapaIds) {
								  ident = mapaIds[miLlave]; 
							  }
							  moduloActividad.on();
							  $.ajax({
								  type: "DELETE",
								  url: "/rest/"+(!hayValor(tipoNombre) ? '' : tipoNombre)+'/'+ident,
								})
								.done(function( msg ) {
									entidad.remove();
									$('body').data('Midgard-midgardNotifications').create({body: JSON.stringify(msg)});
									location.reload();
								})
								.fail(function( jqXHR, textStatus) {
									$('body').data('Midgard-midgardNotifications').create({body: TRADUCTOR['error_ajax'][LENGUAJE]});
								})
								.always(function() {
									moduloActividad.off();
								});
							  moduloMenus.sacarUltimo();
						  }, function() {
							  moduloMenus.sacarUltimo();
						  })
					  });
				  }
			  });
		  }
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
		
		var activarEstilosEditables = function (objeto) {
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
							moduloMenus.mostrarFormularioEdicion(padre.attr('about'), propiedad, valorAnterior);
						} else if (e.ctrlKey) {
							//Se permtie diréctamente actualizar el fondo
							abrirFileChooser(self, propiedad);
						}
					});
					self.attr("act_style", "ok");
				}
			});
		};
		
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
			moduloMenus.mostrarFormularioEdicion(attrs.ident, attrs.propiedad, self.attr('alt'), '_alt');
		}
		
		//Todas las imágenes podrán cambiar con click
		var abrirFileChooser = function(self, propEstilo) {
			var attrs = comunEdicionImagenes(self, propEstilo);
			if (attrs.ok == false) {return;}
			
			var valoresCargue = moduloImagenes.darValoresCargue(self);
			
			var promesaCargue = moduloArchivos.subirArchivo({
				dataFolder: valoresCargue.dataFolder,
				id: moduloImagenes.darIdAnterior(self, hayValor(propEstilo)),
				maximoTamanio: valoresCargue.maximoTamanio,
			});
			
			$.when(promesaCargue).then(function(data) {
				var valor = moduloImagenes.asignarSrc(self, data.id, hayValor(propEstilo));
	    		funcionAsignarPropiedadDeNodo(vie, attrs.ident, attrs.propiedad, valor);
			});
		  };
		  
			var activarImagenes = function (objeto) {
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
			};
			
			//------------------imagenes---------------------

			//------------------html editables---------------------
			var activarEditables = function (objeto) {
				objeto.find('.editable').each(function (index, element) {
					var actual = $(element);
					if(actual.attr("act_edt") !== "ok") {
						actual.on('click', function() {
							var padre = actual.closest('[about]');
							if (padre) {
								if ($('#midgardcreate-save').css('display') === 'none') {return;}
								moduloMenus.mostrarFormularioEdicion(padre.attr('about'), actual.attr('property'), actual.html());
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
			};
			//------------------html editables---------------------
			
			var activarTextoPlano = function (objeto) {
				objeto.find('[textplain="true"]').each(function (index, element) {
					var actual = $(element);
					if(actual.attr("act_tpl") !== "ok") {
						actual.on('blur', function() {
							actual.html(actual.text());
						});
						actual.attr("act_tpl", "ok");
					}
				});
			};
			
			
			//------------------html fechas---------------------
			var activarFechas = function (objeto) {
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
			};
			//------------------html fechas---------------------
	
	  var inicializar = function() {
		  var diferido = $.Deferred();
		  
			if (typeof getVieHere !== 'undefined' && esFuncion(getVieHere)) {
				try {
					vie = getVieHere();
				} catch (e) {
					console.log('Error obteniendo vie', e)
				}
			}
			
			if (!hayValor(vie) && typeof VIE !== 'undefined') {
				vie = new VIE();
			}
		  
		  //Cuando se instancia inicializa la paginación de lo que exista en el body
		  activarEdicion();
		  activarPaginacion();
				
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
			
			activarEstilosEditables($('body'));	
			activarImagenes($('body'));
			activarEditables($('body'));
			activarTextoPlano($('body'));
			activarFechas($('body'));
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
				  //if (pila[pila.length-1] === "formhtml") {pila.pop();}
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
					  //if (pila[pila.length-1] === "formhtml") {pila.pop();}
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
		  
		  return diferido.promise();
	  };
	
	return {
		'inicializar': inicializar,
		'activarPaginacion': activarPaginacion,
		'activarEdicion': activarEdicion,
		'funcElegirBorrar':funcElegirBorrar,
	};
})();
}