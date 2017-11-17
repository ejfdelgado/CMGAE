
var moduloSonido = function(url) {
	var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', url);
    var diferido = $.Deferred();
    
    audioElement.addEventListener("canplay",function(){
    	diferido.resolve();
    });
    
	var play = function() {
		$.when(diferido).then(function() {
			audioElement.play();
		});
	};
	var stop = function() {
		$.when(diferido).then(function() {
			audioElement.pause();
			audioElement.currentTime = 0;
		});
	};
	return {
		'play': play,
		'stop': stop,
	};
};