SR.config({
	baseUrl: 'js/',
	paths: {
		'mapy': 'libs/mapy',
		'mapyEditor': 'libs/mapy-editor',
		'h': 'app/home'
	}
});

function common(App) {
	App.$window = $(window);
	App.$body = $('body');
	App.$shell = $('#shell');

	App.graphLoader = {
		ready: false,
		duration: 300,
		init: function() {
			this.$L = $('#pc-loading-graph');
			this.ready = true;
			return this;
		},
		show: function() {
			if (this.ready) {
				this.$L.fadeIn(this.duration);
			}
			return this;
		},
		hide: function() {
			if (this.ready) {
				this.$L.fadeOut(this.duration);
			}
			return this;
		}
	};
	App.waitImgsForLoad = function(selection, callback, notError) {
		var ne = notError || false,
			$selection = $(selection),
			numTotal = $selection.length,
			count = 0,
			ready = false,
			detectLoaded = function() {
				count++;
				if (count >= numTotal && !ready) {
					ready = true;
					callback();
				}
			}
		if (numTotal > 0) {
			$selection.each(function() {
				var $img = $(this);
				if ($img[0].complete) {
					detectLoaded();
				} else {
					$img.load(function() {
						detectLoaded();
					});
					if (!ne) {
						$img.error(detectLoaded);
					}
				}
			});
		} else {
			callback();
		}
	};
	$('document').ready(function() {
		App.init();
	});
};

switch (pageID) {
	case 'home':
		SR.set({
			'mapy':'mapy',
			'mapyEditor':'mapyEditor',
			'home': 'h',
		}, function(App) {
			$('document').ready(function() {
				common(App);
			});
		});
		break;
	default:
		//
}