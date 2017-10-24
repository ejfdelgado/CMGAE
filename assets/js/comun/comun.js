var pila = [];

(function($) {

	  var mapaIds = {};
	  if(typeof Backbone != 'undefined') {
		  Backbone.sync = function(method, model, options) {
			  try {
				  var temp = model.toJSON()
				  
				  viejo = temp['@subject'];
				  if (model.isNew()) {
					  if (viejo in mapaIds ) {
						  temp['@subject'] = mapaIds[viejo];
					  } else {
						  temp['@subject'] = '<' + new Date().getTime()+"_"+Math.floor((Math.random() * 10) + 1) + '>';
						  mapaIds[viejo] = temp['@subject'];
					  }
				  }
				  
				  ident = temp['@subject'];
				  tipo = temp['@type'];
				  
				  var matchCampo = /(viejs\.org\/ns\/)(.*)(>)/g.exec(tipo);
				  if (matchCampo) {
					  tipoNombre = matchCampo[2];
				  }
				  
				  var patronIdent = /(<)(.*)(>)/g;
				  var matchIdent = patronIdent.exec(ident);
				  
				  if (matchIdent == null) {
					  options.error('error: no es identificador '+ident);
					  return;
				  }
				  
				  matchIdentFinal = matchIdent[2];
				  
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
	  }
	
	  var funcBorrarCache = function () {
		  waitOn();
		  $.ajax({
			  type: "GET",
			  url: "/act/clearmemcache",
			  data: JSON.stringify({}),
			  contentType: "application/json; charset=utf-8",
			})
			.done(function( msg ) {
				if (msg.error == 0) {
					$('body').data('Midgard-midgardNotifications').create({body: TRADUCTOR['cache_borr_ok'][LENGUAJE]});
				} else {
					$('body').data('Midgard-midgardNotifications').create({body: JSON.stringify(msg)});
				}
				waitOff();
			})
			.fail(function( jqXHR, textStatus ) {
				$('body').data('Midgard-midgardNotifications').create({body: TRADUCTOR['error_ajax'][LENGUAJE]});
				waitOff();
			});
		  if (pila[pila.length-1] === "menu") {pila.pop();}
	  };
	  
	  var funcElegirBorrar = function() {
		  var botones = $('.btnEliminar');
		  if (botones.length > 0) {
			  botones.remove();
		  } else {
			  $('[about]').each(function(indice) {
				  var self = $(this);
				  var panelEliminar = self.find('.btnEliminar');
				  if (panelEliminar.length == 0) {
					  self.prepend($('<div class="btnEliminar">'+
								'<div class="btnEliminarX btnEliminar2 manito"></div>'+
								'<div class="btnEliminarX opciones invisible">'+
								'	<div class="btnEliminar3"></div>'+
								'	<div class="btnEliminar4 manito">Cancelar</div>'+
								'	<div class="btnEliminar5 manito">Aceptar</div>'+
								'</div>'+
								'</div>'));
					  panelEliminar = self.find('.btnEliminar');
					  
					  botonEliminar = panelEliminar.find('.btnEliminar2');
					  botonCancelar = panelEliminar.find('.btnEliminar4');
					  botonAceptar = panelEliminar.find('.btnEliminar5');
					  
					  botonEliminar.click(function() {
						  var self = $(this);
						  self.addClass('invisible');
						  self.siblings('.opciones').removeClass('invisible');
						  
					  });
					  botonAceptar.click(function() {
						  var self = $(this);
						  var entidad = self.closest('[about]');
						  if (entidad.length > 0) {
							  var ident = entidad.attr('about');
							  var tipoNombre = null;
							  tipoNombre = entidad.attr('typeof');
							  
							  var miLlave = (tipoNombre === null || tipoNombre === undefined ? '' : tipoNombre)+'_'+ident;
							  if (miLlave in mapaIds) {
								  ident = mapaIds[miLlave]; 
							  }
							  
							  waitOn();
							  $.ajax({
								  type: "DELETE",
								  url: "/rest/"+(tipoNombre === null || tipoNombre === undefined ? '' : tipoNombre)+'/'+ident,
								})
								.done(function( msg ) {
									entidad.remove();
									$('body').data('Midgard-midgardNotifications').create({body: JSON.stringify(msg)});
									waitOff();
									location.reload();
								})
								.fail(function( jqXHR, textStatus ) {
									$('body').data('Midgard-midgardNotifications').create({body: TRADUCTOR['error_ajax'][LENGUAJE]});
									waitOff();
								});
						  }
					  });
					  botonCancelar.click(function() {
						  var self = $(this);
						  self.closest('.opciones').addClass('invisible');
						  self.closest('.btnEliminar').find('.btnEliminar2').removeClass('invisible');
					  });
				  }
			  });
		  }
		  if (pila[pila.length-1] === "menu") {pila.pop();}
	  };
	  
      abrirToolBar = function() {
	  if ($('body').data('Midgard-midgardToolbar').options.display === 'full') {
		  $('body').data('Midgard-midgardToolbar').__proto__.hide();
		  $('body').data('Midgard-midgardToolbar').options.display = 'minimized';
		} else {
			$('body').data('Midgard-midgardToolbar').__proto__.show();
			$('body').data('Midgard-midgardToolbar').options.display = 'full';
		}
		//$('body').data('Midgard-midgardToolbar').__proto__.__proto__._trigger('statechange', null, $('body').data('Midgard-midgardToolbar').options);
	  	if (pila[pila.length-1] === "menu") {pila.pop();}
	  };
      
	  function crearPartes(loginurl, logouturl, hasuser, isadmin) {
			
			var texto = '<div id="loadingDiv" class="invisible">Espere por favor...</div>'+
			'<div class="menu_core invisible">'+
			'<ul>';
			
			if (hasuser) {
				if (isadmin) {
					texto += '<li><a href="/configurar.html" target="_blank">Configurar</a></li>';
					texto += '<li><a class="menuEliminar manito" onclick="$(\'.menu_core\').toggleClass(\'invisible\');">Borrar</a></li>';
					texto += '<li><a class="clearmemcache manito" onclick="$(\'.menu_core\').toggleClass(\'invisible\');">Borrar memoria</a></li>';
					texto += '<li><a class="create-ui-toggle2 manito" onclick="$(\'.menu_core\').toggleClass(\'invisible\');">Editar</a></li>';
					texto += '<li><a class="manito" onclick="pila.push(\'menu_pagina\'); $(\'.menu_core\').toggleClass(\'invisible\'); $(\'.menu_pagina\').toggleClass(\'invisible\');">Propiedades de p&aacute;gina</a></li>';
				}
				texto += '<li><a href="'+logouturl+'">Salir</a></li>';
			} else {
				texto += '<li><a href="'+loginurl+'">Ingresar</a></li>';
				texto += '<li><a href="'+logouturl+'">Salir</a></li>';
			}
			texto += '</ul></div>';
			
			jQuery('body').append(jQuery(texto));
		}
	  
	  crearPartes(URL_LOGIN, URL_LOGOUT, HAS_USER, IS_ADMIN);
	  
      $('.create-ui-toggle2').click(abrirToolBar);
	  
	  $('.menuEliminar').click(funcElegirBorrar);
	  
	  $('.clearmemcache').click(funcBorrarCache);
	
	  $(document).keyup(function(e) {
		  if (e.keyCode == 27) {
		  	if (pila.length == 0) {
		  		pila.push("menu");
		  		$('.menu_core').removeClass('invisible');
		  	} else {
		  		var ultimo = pila[pila.length-1];
		  		if (ultimo === "menu") {
		  			$('.menu_core').addClass('invisible');
		  		}
		  		if (ultimo === "formhtml") {
		  			$('.formhtml').addClass('invisible');
		  		}
		  		if (ultimo === "menu_pagina") {
		  			$('.menu_pagina').addClass('invisible');
		  			$('.menu_core').removeClass('invisible');
		  		}
		  		pila.pop();
		  	}
		  }
		});
	  
	  function activatePageA(actual) {
			var cursor = actual.attr('data-next');
			var busqueda = JSON.parse(actual.attr('data-q'));
			var template = actual.attr('data-tpl');
			var target = actual.attr('data-target');
			var ipage = parseInt(actual.attr('data-page'));
			
			if (!busqueda['n']) {
				busqueda['n'] = 100;//valor predeterminado en python def buscarGQL(objeto)
			}
			if (!IS_ADMIN) {
				actual.html((ipage*busqueda['n']+1)+" al "+((ipage+1)*busqueda['n']));
			}
			
			if (actual.attr("data-noa") === "1") {
				actual.removeAttr("href");
				actual.on('click', function() {

					var docHtml = document.getElementById(template).innerHTML;

					var destino = $(target);
					var postload = destino.attr('data-postload');
					if (destino.length > 0) {
						waitOn();
						$.ajax({
							type: "PUT",
							url: "/paginar/",
							data: JSON.stringify({busqueda:busqueda, cursor:cursor}),
							contentType: "application/json; charset=utf-8",
						})
						.done(function( msg ) {
							datos = msg['datos'];
							sigui = msg['next'];
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
							
							waitOff();
						})
						.fail(function( jqXHR, textStatus ) {
							console.log('error');
							waitOff()
						});
					}
				});
			}
		};
	  
		
	  $("a[data-next]").each(function(index, element) {
			var actual = $(element);
			activatePageA(actual);
		});
		
	  
	 /*
    $(document).keypress(function(e) {
    	console.log('e.which='+e.keyCode);
    	if (e.shiftKey) {
		  if(e.which == 27) {//Shift + Enter
			  
		  }
    	}
    });*/

})(jQuery);