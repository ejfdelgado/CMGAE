
var moduloHistoria = (function() {
	var OFFSET_VISIBLE = 0.01;//Porcentaje de la altura de la ventana
	
	var inicializar = function() {
		//1. Se itera el dom buscando la clase principal
		$('.mostrar-historia').each(function(i, elem) {
			var jelem = $(elem);
			if (jelem.data('ok') !== true) {
				//Se asegura que se itere solo una vez
				
				//Se esconden los demás hijos
				var hijos = jelem.children();
				jelem.children().addClass('invisible');
				
				//Se clona el primer hijo
				var pHijo = jelem.children(":first").clone();
				var tipoHijo = pHijo[0].tagName;
				
				var analisisTexto = {
					'usar': pHijo.hasClass('historia-texto'),
					'txt': pHijo.text(),
					'tam': pHijo.text().length,
				};
				//Se agrega
				jelem.append(pHijo);
				//Solo se muestra el primer hijo
				pHijo.removeClass('invisible');
				
				jelem.data('darIndicePonderado', function(ponderacion) {
					return parseInt(ponderacion*(hijos.length-1));//Por que no se desea contar el hijo agregado
				});
				
				//Se agrega la función de actualización
				jelem.data('act', function(datos) {
					var internos = {
						'pos': jelem.offset(),
						'altura': jelem.height(),
					};
					internos.ymin = internos.pos.top;
					internos.ymax = internos.pos.top + internos.altura;
					//1. Se mira si está visible
					internos.vExtSup = (internos.ymin >= datos.ymin && internos.ymin <= datos.ymax);
					internos.vExtInf = (internos.ymax >= datos.ymin && internos.ymax <= datos.ymax);
					internos.vis = internos.vExtInf || internos.vExtSup;
					
					var ext1 = (internos.ymin - datos.alturaVentana - datos.offset);
					var ext2 = (internos.ymax - datos.offset);
					internos.p1 = ponderar(datos.scroll, ext1, ext2);
					internos.p2 = ponderar(datos.scroll, ext1+internos.altura, ext2-internos.altura);
					internos.i1 = jelem.data('darIndicePonderado')(internos.p1);
					internos.i2 = jelem.data('darIndicePonderado')(internos.p2);
					
					//Se calcula el hijo ponderado
					var hijoPonderado = $(hijos[internos.i2]);
					
					//Se aplican los estilos del hijo ponderado
					var estiloPonderado = hijoPonderado.attr('style');
					pHijo.attr('style', estiloPonderado);
					
					//Se pasa el texto ponderado
					if (analisisTexto.usar) {
						pHijo.text(analisisTexto.txt.substring(0, analisisTexto.tam*internos.p2));
					}
					
					//Se pasa la fuente de la imagen
					if (tipoHijo == 'IMG') {
						pHijo.attr('src', hijoPonderado.attr('src'));
					}
					
					//jelem.find('.hdebug').text(JSON.stringify(internos));
				});
				
				jelem.data('ok', true);
			}
		});
		
		$(window).on("scroll resize", refrescar);
	};
	
	//ext2 debe ser mayor que ext1
	var ponderar = function(val, ext1, ext2) {
		if (ext1 >= ext2) {
			return 0;
		}
		if (val < ext1) {
			return 0;
		}
		if (val > ext2) {
			return 1;
		}
		return (val - ext1)/(ext2 - ext1);
	};
	
	var refrescar = function(){
		var datos = {
			'scroll': $(window).scrollTop(),
			'alturaVentana': $( window ).height(),
			//'alturaDocumento': $( document ).height(),
		};
		datos.offset = parseInt(datos.alturaVentana*OFFSET_VISIBLE);
		datos.ymin = (datos.scroll + datos.offset);
		datos.ymax = (datos.scroll + datos.alturaVentana - datos.offset);
		$('.mostrar-historia').each(function(i, elem) {
			var jelem = $(elem);
			if (typeof jelem.data('act') === 'function') {
				jelem.data('act')(datos);
			}
		});
	};
	
	$( document ).ready(function() {
		inicializar();
		refrescar();
	});
	
	return {
		'inicializar': inicializar
	}
})();