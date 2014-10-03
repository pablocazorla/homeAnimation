;
(function() {
	/*
	 * Variables
	 *
	 */
	var definitions,
		app,
		cfg = {
			baseUrl: '',
			sufix: 'js',
			paths: {},
			defaults: {}
		},
		initialized = false,

		/*
		 * Private Methods
		 *
		 */
		extend = function(destination, source) {
			for (var property in source) {
				if (source[property] && source[property].constructor && source[property].constructor === Object) {
					destination[property] = destination[property] || {};
					arguments.callee(destination[property], source[property]);
				} else {
					destination[property] = source[property];
				}
			}
			return destination;
		},
		reset = function() {

			return this;
		},
		formatUrl = function(url) {
			if (typeof url == 'string') {
				var url = [url];
			}
			var newUrl = [];
			for (var i = 0; i < url.length; i++) {
				if (url[i].indexOf('.' + cfg.sufix) == -1) {
					url[i] += '.' + cfg.sufix;
				}
				if (url[i].indexOf('//') == -1) {
					url[i] = cfg.baseUrl + url[i];
				}
				newUrl.push(url[i]);
			}
			return newUrl;
		},
		addScript = function(url, callback) {
			var callback = callback || function() {},
				ii = 0,
				s,
				asyncVariable = '',
				ErrorHandler = function() {
					document.body.removeChild(s);
					ii++;
					if (ii < url.length) {
						getScript();
					} else {
						callback();
					}
				},
				getScript = function() {
					s = document.createElement('script');
					s.type = 'text/javascript';
					s.async = 'async';
					//if this is IE8 and below
					if (typeof document.attachEvent === "object") {
						asyncVariable = '?async=' + Math.round(Math.random() * 1000000000);
						s.onreadystatechange = function() {
							if (s.readyState === 'loaded') {
								var im = new Image();
								im.src = url[ii];
								im.onerror = ErrorHandler;
								callback();
							};
						};
					} else {
						//this is not IE8 and below, so we can actually use onload
						s.onload = function() {
							callback();
						};
						s.onerror = ErrorHandler;
					};
					s.src = url[ii] + asyncVariable;
					document.body.appendChild(s);
				};
			getScript();
		},

		/*
		 * Public Methods
		 *
		 */
		config = function(obj) {
			cfg = extend(cfg, obj);
			return this;
		},
		set = function(requeriments, callback) {
			definitions = [];
			app = {};
			var elems = [],
				routes = [],
				requeriments = extend(cfg.defaults, requeriments);
			for (var a in requeriments) {
				elems.push(a);
				routes.push(requeriments[a]);
			};
			var i = 0,
				l = routes.length,
				loadScripts = function() {
					if (i < l) {
						var u = cfg.paths[routes[i]] || routes[i];
						addScript(formatUrl(u), function() {
							if (definitions.length < i) {
								define(function() {
									return {}
								});
							};
							loadScripts();
						});
						i++;
					} else {
						var lb = definitions.length;
						for (var ib = 0; ib < lb; ib++) {
							app[elems[ib]] = definitions[ib];
						}
						app.init = function() {
							for (var a in app) {
								if (typeof app[a].init != 'undefined') {
									app[a].init();
								}
							}
						}
						callback.apply(this, [app]);
					}
				};
			loadScripts();
		},
		define = function(fn) {
			var obj = fn.apply(this, [app]);
			definitions.push(obj);
		};

	/*
	 * Shortcuts
	 *
	 */
	window.SimplyR = window.SR = {
		config: config,
		set: set,
		define: define
	}

	/*
	 * Initialization
	 *
	 */
	if (!initialized) {
		if (document.currentScript) {
			var mainScript = document.currentScript;
		} else {
			var scripts = document.getElementsByTagName('script');
			var mainScript = scripts[scripts.length - 1];
		}
		addScript(formatUrl(mainScript.getAttribute('data-main')));
	}
})();