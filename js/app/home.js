SR.define(function(App) {
	'use strict';


	return {
		init: function() {


			$('#home-container').height(App.$window.height());

			var myMap = Mapy({
				id : 'home-container',
				circular: false,
				initial : 0,
				panorama : false,
				hash : false
			}).setup([{
				id: "rojo",
				translate: {
					x: 978,
					y: 353
				},
				rotate: {
					z: -27
				},
				scale: {
					x: 1.48
				}
			}, {
				id: "azul",
				translate: {
					x: -69,
					y: -379
				},
				rotate: {
					y: 60
				}
			}, {
				id: "verde",
				translate: {
					x: -715,
					y: 332
				},
				rotate: {
					z: -72
				}
			}, {
				id: "gris",
				translate: {
					x: 273,
					y: 360
				},
				rotate: {
					z: 57
				}
			}, {
				id: "naranja",
				translate: {
					x: 300,
					y: -300
				}
			}]);
		}
	}
});