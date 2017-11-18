
if (!hayValor(moduloJuegoVista)) {
	
	var pluginsModuloVistaJuego = {
		'score': {
			boton: {icono:'fa-star', color: 'btn-default'},
			programa: function(metadata) {
				return {
					'url': '/assets/cmgae/juego/modos/score.html', 
					'funInicio': function(plantilla) {
						return $(plantilla);
					},
					'lista': metadata.jugadores,
					'funIter': function(plantilla, i, llave, unJugador) {
						plantilla = plantilla.replace('$1', darHtmlSeguro(unJugador.apodo));
						plantilla = plantilla.replace('$2', unJugador.puntos);
						var nuevo = $(plantilla);
						nuevo.find('.abc-chao').on('click', function() {
							metadata.moduloJuego.borrarJugador(llave);
						});
						return nuevo;
					},
					'funOrdenar': function(a, b) {
						return b.puntos-a.puntos;
					}
				};
			},
		},
		'pregunta': {
			boton: {icono:'fa-question', color: 'btn-info'},
			programa: function(metadata) {
				return {
					'url':'/assets/cmgae/juego/modos/pregunta.html', 
					'funInicio':function(plantilla) {
						plantilla = plantilla.replace('$1', darHtmlSeguro(metadata.preguntaActual.texto));
						return $(plantilla);
					},
					'lista':metadata.preguntaActual.respuestas,
					'funIter':function(plantilla, i, llave, elemento) {
						plantilla = plantilla.replace('$2', darHtmlSeguro(elemento.texto));
						var nuevo = $(plantilla);
						nuevo.find('.panel-body').css('background-color', elemento.color);
						nuevo.on('click', function() {
							if (esFuncion(metadata.moduloJuego.usuarioEligeRespuesta)) {
								metadata.moduloJuego.usuarioEligeRespuesta(llave, elemento, nuevo, metadata.preguntaActual.id);
							}
						});
						return nuevo;
					}
				};
			},
		},
		'respuesta': {
			boton: {icono:'fa-check', color: 'btn-primary'},
			programa: function(metadata) {
				return {
					'url':'/assets/cmgae/juego/modos/respuesta.html', 
					'funInicio':function(plantilla) {
						plantilla = plantilla.replace('$1', darHtmlSeguro(metadata.preguntaActual.respuesta));
						return $(plantilla);
					}
				};
			},
		},
		'barras': {
			boton: {icono:'fa-check', color: 'btn-danger'},
			programa: function(metadata) {
				return {
					'url':'/assets/cmgae/juego/modos/barras.html', 
					'funInicio': function(plantilla) {
						return $(plantilla);
					},
					'recargarHtml': false,
					'funFinalizar':function() {
						//1. Se crea la data
						if (!hayValor(metadata.data)) {
							metadata.data = {
							  labels: [],
							  datasets: [{
							    label: "# de Personas",
							    backgroundColor: "rgba(255,99,132,0.2)",
							    borderColor: "rgba(255,99,132,1)",
							    borderWidth: 2,
							    hoverBackgroundColor: "rgba(255,99,132,0.4)",
							    hoverBorderColor: "rgba(255,99,132,1)",
							    data: [],
							  }]
							};
						}
						
						metadata.data.labels = [];
						metadata.data.datasets[0].data = [];
						$.each(metadata.preguntaActual.respuestas, function(llave, valor) {
							metadata.data.labels.push(valor.texto);
							metadata.data.datasets[0].data.push(darNumeroAleatorio(3, 10));
						});

						//2. Se crean las opciones
						if (!hayValor(metadata.chart)) {
							var options = {
								responsive: true,
			                    legend: {position: 'top',},
			                    title: {
			                        display: true,
			                        text: deHtmlDarSoloTexto(metadata.preguntaActual.texto),
			                    },
			                    maintainAspectRatio: false,
							  scales: {
							    yAxes: [{
							      stacked: true,
							      gridLines: {
							        display: true,
							        color: "rgba(255,99,132,0.2)"
							      }
							    }],
							    xAxes: [{
							      gridLines: {
							        display: false
							      }
							    }]
							  }
							};
							//Se inicializar el chart
							metadata.chart = Chart.Bar('chart', {
							  options: options,
							  data: metadata.data,
							});
						} else {
							metadata.chart.update();
						}
					}
				};
			},
		},
		'blanco': {
			boton: null,
			programa: function(metadata) {
				return null;
			},
		}
	};
	
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
			metadata: null,
			ultimaPlantilla: null,
		};
		
		var asignarModuloJuego = function(moduloJuego) {
			datos.moduloJuego = moduloJuego;
		};
		
		var asignarPreguntaActual = function(idPregunta, preguntaActual) {
			datos.idPregunta = idPregunta;
			datos.preguntaActual = preguntaActual;
		};
		
		var botones = {};
		var modos = {};
		
		for (let llave in pluginsModuloVistaJuego) {
			let unPlugin = pluginsModuloVistaJuego[llave];
			botones[llave] = unPlugin.boton;
			modos[llave] = unPlugin.programa;
		}
		
		var actualizar = function() {
			regenerarPuntajes();
			var temp = modos[datos.modo](datos.metadata);
			if (hayValor(temp)) {
				remplazarContenido(temp);
			}
		};
		
		var asignarModo = function(llave) {
			console.log('asignarModo', llave);
			if (!estaEnLista(llave, Object.keys(modos))) {
				return;
			}
			if (datos.modo !== llave) {
				//Se recrea la metadata
				datos.metadata = {
					'preguntaActual': datos.preguntaActual,
					'moduloJuego': datos.moduloJuego,
					'jugadores': datos.jugadores,
				};
			}
			datos.modo = llave;
			actualizar();
		};
		
		var asignarPrimerModo = function() {
			console.log('asignarPrimerModo');
			asignarModo(Object.keys(datos.preguntaActual.vistas)[0]);
		};
		
		var asignarJugadores = function(jugadores) {
			console.log('asignarJugadores', datos.modo)
			datos.jugadores = jugadores;
			//Pide actualizar el modo actual
			if (!hayValor(datos.modo)) {
				asignarPrimerModo();
			} else {
				asignarModo(datos.modo);
			}
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
		
		var remplazarContenido = function(props) {
			if (!hayValor(props.recargarHtml)) {
				props.recargarHtml = true;
			}
			
			var funcionDespues = function(plantilla, tieneContenido) {
				console.log('funcionDespues', tieneContenido)
				datos.ultimaPlantilla = props.url;
				if (tieneContenido) {
					datos.elem.empty();
					datos.elem.append(props.funInicio(plantilla, datos.metadata));
				}
				if (hayValor(props.lista)) {
					var listaValores = [];
					var llavesLlaves = [];
					$.each(props.lista, function(llaveLista, valorLista) {
						listaValores.push(valorLista);
						llavesLlaves.push(llaveLista);
					});
					if (esFuncion(props.funOrdenar)) {
						listaValores.sort(props.funOrdenar);
					}
					var repetido = datos.elem.find('.abc-repetir');
					if (repetido.length > 0) {
						repetido.removeClass('abc-repetir');
						repetido.removeClass('invisible');
						var plantilla = darHtmlCompleto(repetido);
						$.each(listaValores, function(i, unJugador) {
							var nuevo = props.funIter(plantilla, i, llavesLlaves[i], unJugador, datos.metadata);
							repetido.after(nuevo);
						});
						repetido.remove();
					}
				}
				if (esFuncion(props.funFinalizar)) {
					props.funFinalizar(datos.metadata);
				}
			};
			
			if (props.recargarHtml == false && datos.ultimaPlantilla == props.url) {
				funcionDespues(null, false);
			} else {
				var promesa = moduloHttp.get(props.url, true);
				promesa.then(function(plantilla) {
					funcionDespues(plantilla, true);
				});
			}
		};
		
		var generarBoton = function(llave, config) {
			var boton = $('<button type="button" class="btn abc-jugar"><i class="fa" aria-hidden="true"></i></button>');
			boton.addClass(config.color);
			boton.find('i').addClass(config.icono);
			boton.on('click', function() {
				asignarModo(llave);
			});
			return boton;
		};
		
		var regenerarBotonesVista = function(pregunta) {
			datos.elemHead.empty();
			$.each(pregunta.vistas, function(llave, val) {
				var boton = generarBoton(llave, botones[llave]);
				datos.elemHead.append(boton);
			})
		};
		
		//Va a una pregunta específica
		var irA = function(indice) {
			datos.idPregunta = datos.juego.orden[indice];
			datos.preguntaActual = datos.juego.preguntas[datos.idPregunta];
			regenerarBotonesVista(datos.preguntaActual);
			asignarPrimerModo();
		};
		
		return {
			'asignarJugadores': asignarJugadores,
			'irA': irA,
			'asignarModo': asignarModo,
			'asignarPreguntaActual': asignarPreguntaActual,
			'asignarModuloJuego': asignarModuloJuego,
			'asignarPrimerModo': asignarPrimerModo,
			'actualizar': actualizar,
		};
	};
}