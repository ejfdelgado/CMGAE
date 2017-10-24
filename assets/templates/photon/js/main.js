/*
	Photon by HTML5 UP
	html5up.net | @n33co
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

function getVieHere() {
	var vie = new VIE();
	
	var configuracionListas = {
			'Caracteristica': {
				ejemplo: '#CaracteristicaEjemplo',
				campos: [
				         {nombre:'imagen', tipo:'Text'},
				         {nombre:'imagen_alt', tipo:'Text'},
				         {nombre:'titulo', tipo:'TextSimple'},
				         {nombre:'contenido', tipo:'nuevo'},
				],
				listas: [{nombre:'lista1'}],
			},
			'Testimonio': {
				ejemplo: '#TestimonioEjemplo',
				campos: [
				         {nombre:'imagen', tipo:'Text'},
				         {nombre:'imagen_alt', tipo:'Text'},
				         {nombre:'titulo', tipo:'TextSimple'},
				         {nombre:'contenido', tipo:'nuevo'},
				],
				listas: [{nombre:'lista6'}],
			}
		};
	
	configurarListasEditor(vie, configuracionListas);
    return vie;
}

function configureEditorsHere() {
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
}

(function($) {
	
	skel.breakpoints({
		xlarge: '(max-width: 1680px)',
		large: '(max-width: 1140px)',
		medium: '(max-width: 980px)',
		small: '(max-width: 736px)',
		xsmall: '(max-width: 480px)',
		xxsmall: '(max-width: 320px)'
	});

	$(function() {

		var	$window = $(window),
			$body = $('body');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 250);
			});

		// Fix: Placeholder polyfill.
			//$('form').placeholder();

		// Prioritize "important" elements on mobile.
			skel.on('+mobile -mobile', function() {
				$.prioritize(
					'.important\\28 mobile\\29',
					skel.breakpoint('mobile').active
				);
			});

		// Scrolly.
			$('.scrolly').scrolly();

	});

})(jQuery);