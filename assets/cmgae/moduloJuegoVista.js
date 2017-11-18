
if (!hayValor(moduloJuegoVista)) {
	var moduloJuegoVista = function(jElem, jElemHead, juego, moduloJuego) {
		var datos = {
			elem: $(jElem),
			elemHead: $(jElemHead),
			juego: juego,
			jugadores: null,
			modo: null,
			idPregunta: null,
			preguntaActual: null,
			moduloJuego: moduloJuego,
		};
		
		var botones = {
			'score': function(llave) {return generarBoton(llave, {icono:'fa-star', color: 'btn-default'});},
			'pregunta': function(llave) {return generarBoton(llave, {icono:'fa-question', color: 'btn-info'});},
			'respuesta': function(llave) {return generarBoton(llave, {icono:'fa-check', color: 'btn-primary'});},
		};
		
		var asignarModuloJuego = function(moduloJuego) {
			datos.moduloJuego = moduloJuego;
		};
		
		var asignarPreguntaActual = function(idPregunta, preguntaActual) {
			datos.idPregunta = idPregunta;
			datos.preguntaActual = preguntaActual;
		};
		
		var modos = {
			'blanco': function() {
				datos.elem.empty();
			},
			'score': function() {
				regenerarPuntajes();
				remplazarContenido(
					'/assets/cmgae/juego/modos/score.html', 
					function(plantilla) {
						return $(plantilla);
					},
					datos.jugadores,
					function(plantilla, i, llave, unJugador) {
						plantilla = plantilla.replace('$1', unJugador.apodo);
						plantilla = plantilla.replace('$2', unJugador.puntos);
						var nuevo = $(plantilla);
						nuevo.find('.abc-chao').on('click', function() {
							datos.moduloJuego.borrarJugador(llave);
						});
						return nuevo;
					}, function(a, b) {
						return b.puntos-a.puntos;
					});
			},
			'pregunta': function() {
				datos.elem.empty();
				remplazarContenido(
						'/assets/cmgae/juego/modos/pregunta.html', 
						function(plantilla) {
							plantilla = plantilla.replace('$1', datos.preguntaActual.texto);
							return $(plantilla);
						},
						datos.preguntaActual.respuestas,
						function(plantilla, i, llave, elemento) {
							plantilla = plantilla.replace('$2', elemento.texto);
							var nuevo = $(plantilla);
							nuevo.find('.panel-body').css('background-color', elemento.color);
							nuevo.on('click', function() {
								if (esFuncion(datos.moduloJuego.usuarioEligeRespuesta)) {
									datos.moduloJuego.usuarioEligeRespuesta(llave, elemento, nuevo, datos.preguntaActual.id);
								}
							});
							return nuevo;
						});
			},
			'respuesta': function() {
				datos.elem.empty();
			}
		};
		
		var modo = function(llave) {
			if (!estaEnLista(llave, Object.keys(modos))) {
				return;
			}
			modos[llave]();
		};
		
		var asignarModo = function(valor) {
			datos.modo = valor;
		};
		
		var asignarPrimerModo = function() {
			datos.modo = Object.keys(datos.preguntaActual.vistas)[0];
		};
		
		var asignarJugadores = function(jugadores) {
			datos.jugadores = jugadores;
			//Pide actualizar el modo actual
			if (!hayValor(datos.modo)) {
				asignarPrimerModo();
			}
			modo(datos.modo);
		};
		
		var regenerarPuntajes = function() {
			if (hayValor(datos.jugadores)) {
				$.each(datos.jugadores, function(jugador, unJugador) {
					//Se cruza cada jugador con los puntajes
					unJugador.puntos = 0;
					if (hayValor(unJugador.respuestas)) {
						$.each(unJugador.respuestas, function(llavePregunta, valorRespuesta) {
							if (hayValor(datos.juego.preguntas[llavePregunta])) {
								var posibles = datos.juego.preguntas[llavePregunta].respuestas;
								if (hayValor(posibles[valorRespuesta])) {
									unJugador.puntos+=parseInt(posibles[valorRespuesta].puntos);
								}
							}
						});
					}
				});
			}
		};
		
		var remplazarContenido = function(url, funInicio, lista, funIter, funOrdenar) {
			var promesa = moduloHttp.get(url, true);
			promesa.then(function(plantilla) {
				datos.elem.empty();
				datos.elem.append(funInicio(plantilla));
				if (hayValor(lista)) {
					var listaValores = [];
					var llavesLlaves = [];
					$.each(lista, function(llaveLista, valorLista) {
						listaValores.push(valorLista);
						llavesLlaves.push(llaveLista);
					});
					if (esFuncion(funOrdenar)) {
						listaValores.sort(funOrdenar);
					}
					var repetido = datos.elem.find('.abc-repetir');
					if (repetido.length > 0) {
						repetido.removeClass('abc-repetir');
						repetido.removeClass('invisible');
						var plantilla = darHtmlCompleto(repetido);
						$.each(listaValores, function(i, unJugador) {
							var nuevo = funIter(plantilla, i, llavesLlaves[i], unJugador);
							repetido.after(nuevo);
						});
						repetido.remove();
					}
				}
			});
		};
		
		var generarBoton = function(llave, config) {
			var boton = $('<button type="button" class="btn abc-jugar"><i class="fa" aria-hidden="true"></i></button>');
			boton.addClass(config.color);
			boton.find('i').addClass(config.icono);
			boton.on('click', function() {
				modos[llave]();
			});
			return boton;
		};
		
		var regenerarBotonesVista = function(pregunta) {
			datos.elemHead.empty();
			$.each(pregunta.vistas, function(llave, val) {
				var boton = botones[llave](llave);
				datos.elemHead.append(boton);
			})
		};
		
		var irA = function(indice) {
			datos.idPregunta = datos.juego.orden[indice];
			datos.preguntaActual = datos.juego.preguntas[datos.idPregunta];
			regenerarBotonesVista(datos.preguntaActual);
			asignarPrimerModo();
		};
		
		return {
			'asignarJugadores': asignarJugadores,
			'modo': modo,
			'irA': irA,
			'asignarModo': asignarModo,
			'asignarPreguntaActual': asignarPreguntaActual,
			'asignarModuloJuego': asignarModuloJuego,
		};
	};
}