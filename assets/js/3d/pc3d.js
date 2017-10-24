
var pi = 3.141592;
var pimed = 1.570796;

//Aca se registran las funciones de eventos
var callbacks = {};

function activarModelos3d() {
	$( ".model3d" ).each(function( index ) {
		var elemento = $(this);
		activarElemento(elemento);
	});
}

function tic() {
	return new Date().getTime();
}

function agregarObservador(elemento, variable, funcion) {
	var temp;
	variable = 'var_'+variable;
	if (callbacks[elemento] === undefined) {callbacks[elemento] = {};}
	if (callbacks[elemento][variable] === undefined) {
		callbacks[elemento][variable] = [];
	}
	//Se agrega
	callbacks[elemento][variable].push(funcion);
}

function invocarObservadores(elemento, variable1, valor1) {
	var variable = 'var_'+variable1;
	if (callbacks[elemento] === undefined) {return;}
	var arreglo = callbacks[elemento][variable];
	if (arreglo !== undefined) {
		for (var i = 0; i < arreglo.length; i++) {
			arreglo[i](elemento, variable1, valor1);//Se invoca
		}
	}
}

function actualizarValores(elemento, t) {
	var json = elemento.data('guion');
	if (json === undefined) {return;}
	var last_t = elemento.data('guion_last_t');
	if (last_t === t) {return;}
	for(var key in json) {
		var value = json[key];
		//Debo clasificarlo
		var tam = value.length;
		if (tam > 0) {
			var nuevo_val = null;
			if (t <= value[0].t) {//Anterior al primero
				nuevo_val = value[0].v;
			} else if (t >= value[tam-1].t) {//mayor que el último
				nuevo_val = value[tam-1].v;
			} else {//intermedio debo buscar indice anterior y siguiente
				var paso = undefined;
				for (var i=1; i<tam; i++) {
					if (value[i-1].t < t && value[i].t >= t) {
						paso = i;
						break;
					}
				}
				if (paso !== undefined) {
					var val1 = value[paso-1].v;
					var val2 = value[paso].v;
					if ($.isNumeric(val1)) {
						var t1 = value[paso-1].t;
						var t2 = value[paso].t;
						var pond = (t-t1)/(t2-t1);
						nuevo_val = (val2-val1)*pond+val1;
					} else {
						nuevo_val = val1;
					}
				}
			}
			if (elemento.data('var_'+key) !== nuevo_val) {
				elemento.data('var_'+key, nuevo_val);
				invocarObservadores(elemento, key, nuevo_val);//Se disparan los observadores
			}
		}
	}
	elemento.data('guion_last_t', t);
	return;
}

function renderOne(arg) {
		var renderer = arg.data('renderer');
		var camera = arg.data('camera');
		var scene = arg.data('scene');
		var procesot = arg.data('procesot');
		var ahora = tic();
		var diff = ahora - arg.data('last');
		var t = arg.data('t');
		t=t/1000;
		
		actualizarValores(arg, t);		
		
		//Se actualiza la barra de proceso
		var porcentaje = Math.min(100, 100*t/calcularDuracionVideo(arg));
		$(procesot).css({width: porcentaje+'%'});
		
		if (porcentaje == 100) {
			var play = arg.find('.play3d_off').get(0);
			$(play).addClass('play3d_on');
			$(play).removeClass('play3d_off');
			arg.data('reproducir', false);
		}
		
		renderer.render( scene, camera );
		if (arg.data('reproducir') === true) {
			arg.data('t', arg.data('t')+diff);
		}
		arg.data('last', ahora);
		
		if (arg.data('edit') === true) {
			arg.data('edit', false);
		}
}

function animate() {
	requestAnimationFrame( animate );
	$( ".model3d" ).each(function( index ) {
		if ($(this).data('construido') === true && ($(this).data('animar') === true || $(this).data('reproducir') === true) || $(this).data('changetime') === true || $(this).data('edit') === true) {
			renderOne($(this));
		}
	});
}

function resizeOne(superelemento) {
	var elemento = $(superelemento.data('player'));
	var last_size = superelemento.data('last_size');
	if (last_size === undefined) {
		last_size = [0, 0];
	}
	if (elemento.width() != last_size[0] || elemento.height() != last_size[1]) {//Ha cambiado
		superelemento.data('last_size', [elemento.width(), elemento.height()]);
		
		var renderer = superelemento.data('renderer');
		var camera = superelemento.data('camera');
		var texto = superelemento.data('texto');
		if (renderer !== undefined && camera !== undefined) {
			renderer.setSize( elemento.width(), elemento.height() );
			camera.aspect = elemento.width() / elemento.height();
			camera.updateProjectionMatrix();
			renderOne(superelemento);
		}
		//Ajusta el texto
		texto.style.width = elemento.width()+'px';
		texto.style.height = elemento.height()+'px';
		
		//Ajusta el canvas
		var editorFondo = superelemento.data('editorFondo');
		var videoImage = superelemento.data('videoImage');
		var proporcion = $(editorFondo).width()/$(editorFondo).height();
		var proporcion2 = $(videoImage).width()/$(videoImage).height();
		if (proporcion < proporcion2) {
			$(videoImage).addClass('canvaseditw');
			$(videoImage).removeClass('canvasedith');
		} else {
			$(videoImage).addClass('canvasedith');
			$(videoImage).removeClass('canvaseditw');
		}
	}
}

function checkResize() {
	$( ".model3d" ).each(function( index ) {
		var elemento = $(this);
		resizeOne(elemento);
	});
}

function tiempoMove(elemento, res, e) {
	var barra = $(elemento).find('.tiempo3dAction').get(0);
	var bb = barra.getBoundingClientRect();
	
	var x = (e.clientX - bb.left)/$(barra).width();
	
	function timepoMoveImp() {
		elemento.data('t', 1000*x*calcularDuracionVideo(elemento));
		elemento.data('changetime', true);
	}
	
	if (res == 'down') {
		elemento.data('tiempo_flag',true);
		timepoMoveImp();
	}
	if (res == 'up' || res == "out") {
		elemento.data('tiempo_flag',false);
		elemento.data('changetime', false);
	}
	if (res == 'move') {
		if (elemento.data('tiempo_flag') === true) {//dragging
			timepoMoveImp();
		}
	}
}

function pickColor(elemento, res, e) {
	var canvasColor = elemento.data('canvasColor');
	var bb = canvasColor.getBoundingClientRect();
	var ctx = canvasColor.getContext('2d');
	
	var x = ctx.canvas.width*(e.clientX - bb.left)/$(canvasColor).width();
	var y = ctx.canvas.height*(e.clientY - bb.top)/$(canvasColor).height();
	
	function tomarColor() {
		var p = ctx.getImageData(parseInt(x), parseInt(y), 1, 1).data;
		var rgb = rgbToHex(p[0], p[1], p[2]);
		$(elemento).find('.sample3d').css({'background-color':rgb});
		elemento.data('mycolor', rgb);
	}
	
	if (res == 'down') {
		elemento.data('pick_flag',true);
		tomarColor();
	}
	if (res == 'up' || res == "out") {
		elemento.data('pick_flag',false);
	}
	if (res == 'move') {
		if (elemento.data('pick_flag') === true) {//dragging
			tomarColor();
		}
	}
}

function findxy(elemento, res, e) {
	var color = elemento.data('mycolor');

	var canvas = elemento.data('videoImage');
	var ctx = elemento.data('videoImageContext');
	var videoTexture = elemento.data('videoTexture');
	var bb = canvas.getBoundingClientRect();
	
	var x = ctx.canvas.width*(e.clientX - bb.left)/$(canvas).width();
	var y = ctx.canvas.height*(e.clientY - bb.top)/$(canvas).height();
	
	var canvasjq = $(canvas);
    if (res == 'down') {
        canvasjq.data('prevX', canvasjq.data('currX'));
        canvasjq.data('prevY', canvasjq.data('currY'));
        canvasjq.data('currX', x);
        canvasjq.data('currY', y);

        canvasjq.data('flag',true);
        canvasjq.data('dot_flag',true);
        if (canvasjq.data('dot_flag')) {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.fillRect(canvasjq.data('currX'), canvasjq.data('currY'), 2, 2);
            ctx.closePath();
            canvasjq.data('dot_flag',false);
			elemento.data('edit', true);
        }
    }
    if (res == 'up' || res == "out") {
        canvasjq.data('flag',false);
    }
    if (res == 'move') {
        if (canvasjq.data('flag')) {
			canvasjq.data('prevX', canvasjq.data('currX'));
			canvasjq.data('prevY', canvasjq.data('currY'));
			canvasjq.data('currX', x);
			canvasjq.data('currY', y);
			elemento.data('edit', true);
            
			ctx.lineWidth = 2;
			ctx.strokeStyle = color;
			ctx.beginPath();
			ctx.moveTo(canvasjq.data('prevX'), canvasjq.data('prevY'));
			ctx.lineTo(x, y);
			ctx.stroke();
        }
    }
	videoTexture.needsUpdate = true;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function activarElemento(elemento) {
	if (elemento.data('construido') !== undefined) return;//Est� en proceso
	elemento.data('construido', false);
	
	if (!window.WebGLRenderingContext) {
		elemento.data('construido', false);
		return;
	}
	
	var canvas = document.createElement("canvas");
    var context = canvas.getContext("webgl");
    if (!context) {
    	elemento.data('construido', false);
		return;
    }
	
	function restaurarAnterior() {
		elemento.html(elemento.data('oldcontent'));
	}
	
	elemento.data('oldcontent', elemento.html());
	elemento.empty();//Borro el contenido anterior
	
	try {
		elemento.data('t', 0);
		elemento.data('reproducir', false);
		elemento.data('dx', 0.5);
		elemento.data('dy', 0.1);
		elemento.data('edit', false);
		elemento.data('mycolor', '#FFFFFF');
	
		var modelo = elemento.attr('data-model');
		var material = elemento.attr('data-material');
		var imgurl = elemento.attr('data-img');
		
		var divPlayer = document.createElement('div');
		$(divPlayer).addClass('divplayer');
		$(divPlayer).addClass('divplayerhalf');
		elemento.append(divPlayer);
		
		var divEditor = document.createElement('div');
		var divEditorFondo = document.createElement('div');
		$(divEditor).addClass('diveditor');
		$(divEditorFondo).addClass('editorfondo');
		$(divEditor).append(divEditorFondo);
		$(divEditor).append($('<div class="editorcontrol3d"><div class="control3drow"><div class="uncontrol reload3d_on"></div><div class="tiempo3d"><div class="tiempo3dout fondoColor"><div class="tiempo3dbar" style="width: 0%;"></div></div></div><div class="controlesp"></div><div class="uncontrol sample3d"></div><div class="controlesp"></div></div></div>'));
		elemento.append(divEditor);
		
		var imgColorPicker = $('<img>');
		imgColorPicker.attr('src', '/assets/img/color-picker.png');
		imgColorPicker.load(function() {
			canvasColor = document.createElement( 'canvas' );
			elemento.data('canvasColor', canvasColor);
			$(canvasColor).addClass('color3dAction');
			$(canvasColor).addClass('noselect');
			
			canvasColor.width = this.width;
			canvasColor.height = this.height;
			
			videoImageContext = canvasColor.getContext( '2d' );
			videoImageContext.drawImage( imgColorPicker.get(0), 0, 0 );
			
			canvasColor.addEventListener("mousemove", function (e) {
				pickColor(elemento, 'move', e)
			}, false);
			canvasColor.addEventListener("mousedown", function (e) {
				pickColor(elemento, 'down', e)
			}, false);
			canvasColor.addEventListener("mouseup", function (e) {
				pickColor(elemento, 'up', e)
			}, false);
			canvasColor.addEventListener("mouseout", function (e) {
				pickColor(elemento, 'out', e)
			}, false);
			
			$(divEditor).find('.tiempo3dout').removeClass('fondoColor');
			$(divEditor).find('.tiempo3dout').append(canvasColor);
		});
		
		$(divEditor).find('.reload3d_on').bind('click', function() {
			var imagen = elemento.data('imagen');
			var videoImageContext = elemento.data('videoImageContext');
			videoImageContext.drawImage(imagen.get(0), 0, 0);
			videoImageContext.needsUpdate = true;
			elemento.data('edit', true);
		});
		
		elemento.data('editorFondo', divEditorFondo);
		
		//Camera
		var camera = new THREE.PerspectiveCamera( 45, $(divPlayer).width() / $(divPlayer).height(), 1, 2000 );
		camera.position.y = 1;
		
		//Scene
		var scene = new THREE.Scene();
		
		//Luz
		var ambient = new THREE.AmbientLight( 0xFFFFFF );
		scene.add( ambient );
		
		//Renderer
		var renderer = new THREE.WebGLRenderer({ alpha: true });
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( $(divPlayer).width(), $(divPlayer).height() );
		renderer.setClearColor(0xffffff, 1);
		$(divPlayer).append( renderer.domElement );//Agrego el canvas
		
		//Etiqueta
		var texto = document.createElement('p');
		$(texto).addClass('noselect');
		$(texto).addClass('mitexto');
		texto.style.width = $(divPlayer).width()+'px';
		texto.style.height = $(divPlayer).height()+'px';
		$(divPlayer).append(texto);//Agrego etiqueta
		
		elemento.data('renderer', renderer);
		elemento.data('camera', camera);
		elemento.data('scene', scene);
		elemento.data('texto', texto);
		elemento.data('player', divPlayer);
		
		texto.innerHTML = '';
		
		$(texto).tapstart(function(e, touch) {
			$(this).data('drag', true);
			var x = touch.position.x/$(this).width();
			var y = touch.position.y/$(this).height();
			elemento.data('x', x);
			elemento.data('y', y);
		});
		
		$(texto).tapend(function(e, touch) {
			$(this).data('drag', false);
		});
		
		$(texto).tapmove(function(e, touch) {
			if ($(this).data('drag')===true) {
				var x = touch.position.x/$(this).width();
				var y = touch.position.y/$(this).height();
				
				var lx = elemento.data('x');
				var ly = elemento.data('y');
				
				var dx = elemento.data('dx');
				var dy = elemento.data('dy');
				
				dx = dx + x - lx;
				dy = dy + y - ly;
				
				if (dx < 0) {dx = 0;}
				if (dx > 1) {dx = 1;}
				if (dy < 0) {dy = 0;}
				if (dy > 1) {dy = 1;}
				
				elemento.data('dx', dx);
				elemento.data('dy', dy);
				
				elemento.data('x', x);
				elemento.data('y', y);
				//Se debe invocar la actualizacion de posicion
				invocarObservadores(elemento, 'pos', [dx, dy]);
			}
		});
		
		$(texto).mouseenter(function() {
			if (elemento.data('construido') === true) {
				elemento.data('animar', true);
				elemento.data('last', tic());
			}
		}).mouseleave(function() {
			if (elemento.data('construido') === true) {
				elemento.data('animar', false);
			}
			$(this).data('drag', false);
		}).mouseenter(function() {
			$(this).data('drag', false);
		});
		
		var controles = document.createElement('div');
		$(controles).addClass('control3d');
		
		var fila = document.createElement('div');
		$(fila).addClass('control3drow');
		$(controles).append(fila);
		
		var play = document.createElement('div');
		$(play).addClass('uncontrol');
		$(play).addClass('play3d_on');
		
		$(play).bind('click', function() {
			if ($(this).hasClass('play3d_on')) {
				$(this).removeClass('play3d_on');
				$(this).addClass('play3d_off');
				
				var t = elemento.data('t');
				t=t/1000;
				var porcentaje = Math.min(100, 100*t/calcularDuracionVideo(elemento));
				if (porcentaje == 100) {
					elemento.data('t', 0);
				}
				
				elemento.data('last', tic());
				elemento.data('reproducir', true);
			} else {
				$(this).addClass('play3d_on');
				$(this).removeClass('play3d_off');
				elemento.data('reproducir', false);
			}
		});
		$(fila).append(play);
		
		var proceso = document.createElement('div');
		var procesoo = document.createElement('div');
		var procesot = document.createElement('div');
		var procesoa = document.createElement('div');
		$(proceso).addClass('tiempo3d');
		$(procesoo).addClass('tiempo3dout');
		$(procesoo).addClass('tiempo3doutborder');
		$(procesot).addClass('tiempo3dbar');
		$(procesoa).addClass('tiempo3dAction');
		$(procesoa).addClass('noselect');
		$(proceso).append(procesoo);
		$(proceso).append(procesoa);
		$(procesoo).append(procesot);
		$(fila).append(proceso);
		elemento.data('procesot', procesot);
	
		procesoa.addEventListener("mousemove", function (e) {
			tiempoMove(elemento, 'move', e)
		}, false);
		procesoa.addEventListener("mousedown", function (e) {
			tiempoMove(elemento, 'down', e)
		}, false);
		procesoa.addEventListener("mouseup", function (e) {
			tiempoMove(elemento, 'up', e)
		}, false);
		procesoa.addEventListener("mouseout", function (e) {
			tiempoMove(elemento, 'out', e)
		}, false);
		
		
		var esp = document.createElement('div');
		$(esp).addClass('controlesp');
		$(fila).append(esp);
		
		var full = document.createElement('div');
		$(full).addClass('uncontrol');
		$(full).addClass('full3d_on');
		
		$(full).bind('click', function() {
			if ($(this).hasClass('full3d_on')) {
				$(this).removeClass('full3d_on');
				$(this).addClass('full3d_off');
				elemento.addClass('model3dfull');
			} else {
				$(this).addClass('full3d_on');
				$(this).removeClass('full3d_off');
				elemento.removeClass('model3dfull');
			}
			resizeOne(elemento);
		});
		
		$(fila).append(full);
		
		$(divPlayer).append(controles);//Agrego controles
		
		var onProgress = function ( xhr ) {
			if ( xhr.lengthComputable ) {
				var percentComplete = xhr.loaded / xhr.total * 100;
				percentComplete = Math.round(percentComplete, 2);
				if (percentComplete == 100) {
					actualizarValores(elemento, 0);
					$(texto).html(elemento.data('var_texto'));
				} else {
					texto.innerHTML = Math.round(percentComplete, 2) + '%';
				}
			}
		};
	
		var onError = function ( xhr ) {
			restaurarAnterior();
		};	
		
		elemento.find('.sample3d').css({'background-image': 'url("'+imgurl+'")'});
		
		$.ajax({
			url : elemento.attr('data-guion'),
			dataType: "text",
			error : function() {restaurarAnterior();},
			success : function (data) {
				console.log('exito guion');
				var json = $.parseJSON(data);
				elemento.data('guion', json["keys"]);
				
				for (var i=0; i<json["callbacks"].length; i++) {
					for (var j in json["callbacks"][i]){
						agregarObservador(elemento, j, eval(json["callbacks"][i][j]));
					}
				}
				
				calcularDuracionVideo(elemento);
				
				elemento.find('.sample3d').css({'background-image': ''});
				
				var imagen = $('<img>');
				imagen.attr('src', imgurl);
				imagen.load(function() {
					console.log('exito imagen');
					var width = this.width,
					height = this.height;
					
					videoImage = document.createElement( 'canvas' );
					$(videoImage).addClass('canvasedit');
					videoImage.width = width;
					videoImage.height = height;
					
					$(divEditorFondo).append(videoImage);
	
					videoImageContext = videoImage.getContext( '2d' );
					videoImageContext.fillStyle = '#000000';
					videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
	
					videoImage.addEventListener("mousemove", function (e) {
						findxy(elemento, 'move', e)
					}, false);
					videoImage.addEventListener("mousedown", function (e) {
						findxy(elemento, 'down', e)
					}, false);
					videoImage.addEventListener("mouseup", function (e) {
						findxy(elemento, 'up', e)
					}, false);
					videoImage.addEventListener("mouseout", function (e) {
						findxy(elemento, 'out', e)
					}, false);
					
					videoImageContext.drawImage( imagen.get(0), 0, 0 );
					
					videoTexture = new THREE.Texture( videoImage );
					videoTexture.minFilter = THREE.LinearFilter;
					videoTexture.magFilter = THREE.LinearFilter;
					
					videoTexture.needsUpdate = true;
					
					var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
					
					elemento.data('imagen', imagen);
					elemento.data('videoImage', videoImage);
					elemento.data('videoImageContext', videoImageContext);
					elemento.data('videoTexture', videoTexture);
					elemento.data('movieMaterial', movieMaterial);
					
					var loader = new THREE.OBJMTLLoader();
					
					var partes = elemento.attr('data-remplazar');
					partes = partes.split(/\|/);
					
					loader.load( modelo, material, function ( object ) {
						console.log('exito obj');
						elemento.data('modelo', modelo);
						elemento.data('material', material);
						object.traverse( function ( child ) {
							if ( child instanceof THREE.Mesh ){
								child.material.side = THREE.DoubleSide;
								if (partes.indexOf(child.material.name)>=0) {
									child.material = movieMaterial;
								}
							}
						});
						scene.add( object );
						elemento.data('last', tic());
						elemento.data('construido', true);
						renderOne(elemento);
					}, onProgress, onError );
					
					elemento.data('last', tic());
					resizeOne(elemento);
					renderOne(elemento);		
				});
			}
		});
	} catch (e) {
		restaurarAnterior();
	}
}

function calcularDuracionVideo(elemento) {
	var ans = elemento.data('duracion');
	if (ans !== undefined) {return ans;}
	var guion = elemento.data('guion');
	var max = 0;
	var t;
	if (guion === undefined) {return max;}
	for(var key in guion) {
		var value = guion[key];
		t = value[value.length-1].t;
		if (t>max) {
			max = t;
		}
	}
	elemento.data('duracion', max+1);
	return max;
}

$( document ).ready(function() {
	activarModelos3d();
	$(window).resize(checkResize);
	animate();
});

