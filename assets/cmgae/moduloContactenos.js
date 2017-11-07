
if (!hayValor(moduloContactenos)){
	var moduloContactenos = function() {

		function mostrarMensaje(papa, msg, clase) {
			var tag = 'div';
			var papaTag = papa.prop("tagName");
			if (papaTag == 'UL' || papaTag == 'OL') {tag='li';}
			var elerror = $('<'+tag+' property="'+clase+'" class="'+clase+'"></'+tag+'>');
			elerror.text(msg);
			papa.prepend(elerror);
		};

		//valida un elemento input que responda a val(), prefiere placeholder y después name
		function escorrecto(elemento) {
			var validacion = elemento.attr('validacion');
			var nombre = elemento.attr('placeholder');
			if (nombre === undefined) {nombre = elemento.attr('name');}
			if (validacion !== undefined) {
				if (nombre === undefined) {nombre = validacion;}
				var re = new RegExp(validacion, "gi");
				if(!elemento.val().match(re)) {
					return {error:1, msg: moduloLocal.traducir('general.verifique')+nombre};
				}
			}
			return {error: 0};
		};

		/* Llena los campos de un formulario, prefiere name y luego placeholder */
		function llenarCampos(nuevo, data) {
			//Se asignan los inputs
			nuevo.find('input[type=text],select,textarea').each(function(i, elem) {
				var self = $(elem);
				var nombre = self.attr('name');
				if (nombre === undefined) {nombre = self.attr('placeholder');}
				if (nombre in data) {
					self.val(data[nombre]);
				}
			});
			
			nuevo.find('input[type=checkbox]').each(function(i, elem) {
				var self = $(elem);
				var nombre = self.attr('name');
				if (nombre === undefined) {nombre = self.attr('placeholder');}
				if (nombre in data) {
					if (data[nombre] == 1) {
						self.prop('checked', true);
					} else {
						self.prop('checked', false);
					}
				}
			});
			
			nuevo.find('input[type=radio]').each(function(i, elem) {
				var self = $(elem);
				var nombre = self.attr('name');
				if (nombre === undefined) {nombre = self.attr('placeholder');}
				if (nombre in data) {
					if (data[nombre] == self.attr('value')) {
						self.prop('checked', true);
					} else {
						self.prop('checked', false);
					}
				}
			});
		};

		/* Lee los campos de un formulario, prefiere name y luego placeholder */
		function capturarFormulario(item, data) {
			var ans = [];
			//Primero ejecuta las validaciones sobre input[text] y textarea
			item.find('input[type=text],textarea').each(function(i, elem) {
				var self = $(elem);
				var codigo = escorrecto(self);
				ans.push(codigo);
			});
			
			item.find('input[type=text],select,textarea,input[type=radio]:checked').each(function(i, elem) {
				var self = $(elem);
				var nombre = self.attr('name');
				if (nombre === undefined) {nombre = self.attr('placeholder');}
				if (nombre !== undefined) {
					var valor = self.val();
					data[nombre] = valor;
				}
			});
			
			item.find('input[type=checkbox]').each(function(i, elem) {
				var self = $(elem);
				var nombre = self.attr('name');
				if (nombre === undefined) {nombre = self.attr('placeholder');}
				if (nombre !== undefined) {
					var valor = self.is(':checked') ? 1 : 0;
					data[nombre] = valor;
				}
			});
			
			return ans;
		};
		
		var inicializar = function() {
			/**
			 * Sirve para enviar mensajes:
			 * 
			 * <div class="contenedor-envio-mensajes">
			 * <a class="boton-envio-mensaje button special">Enviar</a>
			 * 
			 * También para hacer CRUD de datos del usuario
			 * 
			 * <div class="contenedor-envio-mensajes" data-preload="/user/personal">
			 * <a class="boton-envio-mensaje" data-url="/user/personal" data-once="false">Salvar</a>
			 */
			$('.contenedor-envio-mensajes[data-preload]').each(function(i, elem) {
				var self = $(this);
				var url = self.attr('data-preload');
				if (url === undefined || url.length == 0) {return;}
				$.ajax({
					type: "GET",
					url: url,
					contentType: "application/json; charset=utf-8",
				})
				.done(function( msg ) {
					llenarCampos(self, msg);
				})
				.fail(function( jqXHR, textStatus ) {
					moduloMenus.error();
				});
			});
	
			//Se activan los formularios y sus respectivos botones
			$(".boton-envio-mensaje").on('click', function() {
				moduloActividad.on();
				var self = $(this);
				var url = self.attr('data-url');
				if (url === undefined || url.length == 0) {
					url = '/act/correo';
				}
				var esconder = self.attr('data-once');
				if (esconder === undefined || esconder.length == 0) {
					esconder = true;
				} else {esconder = false;}
				
				var papa = self.closest('.contenedor-envio-mensajes');
				if (!papa) {return;}
	
				papa.find("[property='error']").remove();
				papa.find('[property="gracias"]').addClass('invisible');
				
				var dicci = {};
				var codigos = capturarFormulario(papa, dicci);
				
				var errores = 0;
				for (var i=0; i< codigos.length; i++) {
					var codigo = codigos[i];
					if (codigo.error != 0) {
						mostrarMensaje(papa, codigo.msg, 'error');
						errores++;
					}
				}
				
				if (errores > 0) {
					moduloActividad.off();
					return;
				}
	
				$.ajax({
					type: "PUT",
					url: url,
					data: JSON.stringify(dicci),
					contentType: "application/json; charset=utf-8",
				})
				.done(function( msg ) {
					if (msg.error == 0) {
						if (esconder) {
							papa.children().addClass('invisible');
						}
						papa.find('[property="gracias"]').removeClass('invisible');
					} else {
						mostrarMensaje(papa, msg.msg, 'error');
					}
					moduloActividad.off();
				})
				.fail(function( jqXHR, textStatus ) {
					//moduloMenus.error();
					mostrarMensaje(papa, textStatus, 'error');
					moduloActividad.off();
				});
			});
		};
		
		inicializar();
		
		return {
			
		};
	};
}