
if (!hayValor(moduloEdicion)) {
var moduloEdicion = (function() {
	var mapaIds = {};
	var activarEdicionOk = false;
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
					  //completo['csrfmiddlewaretoken'] = "{{ csrf_token }}";
					  switch (method) {
					  case 'create':
					  case 'update':
						  moduloActividad.on();
						  $.ajax({
							  type: "PUT",
							  url: "/rest/"+(tipoNombre === null || tipoNombre === undefined ? 'Documento' : tipoNombre)+"/"+matchIdentFinal,
							  data: JSON.stringify(completo),
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
		  if (pila[pila.length-1] === "menu") {pila.pop();}
	  };
	
	//Cuando se instancia inicializa la paginación de lo que exista en el body
	activarPaginacion();
	
	return {
		'activarPaginacion': activarPaginacion,
		'activarEdicion': activarEdicion,
		'funcElegirBorrar':funcElegirBorrar,
	};
})();
}