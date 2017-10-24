
function comunMover(arg, dx, dy, distancia) {
	var camera = arg.data('camera');
	var scene = arg.data('scene');
	camera.position.x = Math.cos(pi*dx)*Math.cos(pimed*dy)*distancia;
	camera.position.z = Math.sin(pi*dx)*Math.cos(pimed*dy)*distancia;
	camera.position.y = Math.sin(pimed*dy)*distancia;
	camera.lookAt( scene.position );
}

var callback1 = function(arg, llave, valor) {
	var etiqueta = arg.data('texto');
	$(etiqueta).html(valor);
};

var callback2 = function(arg, llave, distancia) {
	comunMover(arg, arg.data('dx'), arg.data('dy'), distancia);
};

var callback3 = function(arg, llave, pos) {
	comunMover(arg, pos[0], pos[1], arg.data('var_d'));
};