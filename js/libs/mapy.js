;
(function() {

	/*
	 * UTILITIES
	 *********************************************/
	var utils = {};

	/*
	 * Styles group, to verify if exist some style name
	 * @type {object}
	 */
	var dummyStyles = document.createElement('div').style,
		computedStyles = window.getComputedStyle(document.createElement('div'));

	/* It return right css property name, according to current prefix browser. Also convert the string to camel case
	 * @type {function} @return {string}
	 */
	utils.cssfix = (function() {
		var prefixes = 'Webkit Moz O ms'.split(' '),
			cache = {},
			capitalize = function(str) {
				return str.charAt(0).toUpperCase() + str.slice(1);
			},
			toCamel = function(str) {
				var arryStr = str.split('-'),
					camelStr = arryStr[0];
				for (var i = 1; i < arryStr.length; i++) {
					camelStr += capitalize(arryStr[i]);
				}
				return camelStr;
			};
		return function(property) {
			if (typeof cache[property] === 'undefined') {
				var camelProperty = toCamel(property),
					capitalizedProperty = capitalize(camelProperty),
					prefixedProperties = (property + ' ' + camelProperty + ' ' + prefixes.join(capitalizedProperty + ' ') + capitalizedProperty).split(' ');

				cache[property] = null;
				for (var i in prefixedProperties) {
					if (dummyStyles[prefixedProperties[i]] !== undefined) {
						cache[property] = prefixedProperties[i];
						break;
					}
				}
			}
			return cache[property];
		}
	})();

	/* It return css property name used to compute styles
	 * @type {function} @return {string}
	 */
	utils.computedCss = (function() {
		var computedfixes = '-webkit- -moz- -o- -ms-'.split(' '),
			cache = {};
		return function(property) {
			if (typeof cache[property] === 'undefined') {
				var computedProperties = (property + ' ' + computedfixes.join(property + ' ')).split(' ');

				cache[property] = null;
				for (var i in computedProperties) {
					if (computedStyles.getPropertyValue(computedProperties[i]) !== undefined) {
						cache[property] = computedProperties[i];
						break;
					}
				}

			}
			return cache[property];
		}
	})();

	/*
	 * Convert NodeList to Array
	 * @type {function} @return {array}
	 */
	utils.NodeListToArray = function(nl) {
		/*var arr = [];
		for(var i = nl.length; i--; arr.unshift(nl[i]));*/
		return [].slice.call(nl);
	};
	/*
	 * Return a number from some value
	 * @type {function} @return {number}
	 */
	utils.toNumber = function(num, defaultValue) {
		return isNaN(parseFloat(num)) ? (defaultValue || 0) : parseFloat(num);
	};

	/*
	 * Extend an object with another
	 * @type {function} @return {object}
	 */
	utils.extendObject = function(destination, source) {
		var source = source || {};
		for (var property in source) {
			if (source[property] && source[property].constructor && source[property].constructor === Object) {
				destination[property] = destination[property] || {};
				arguments.callee(destination[property], source[property]);
			} else {
				destination[property] = source[property];
			}
		}
		return destination;
	};

	/*
	 * Counter used only to generate a unique and random id for a node, if necessary
	 * @type {number}
	 */
	utils.idCounter = 0;

	/*
	 * Location hash handler
	 * @type {function} @return {string}
	 */
	utils.hash = function(str) {
		if (typeof str === 'string') {
			window.location.hash = '#' + str;
			return str;
		} else {
			return window.location.hash.slice(1);
		}
	};

	/*
	 * Class List handler handler
	 * @type {function} @return {string}
	 */
	utils.classToData = function(element, classToSearch) {
		var classList = element.className.split(' '),
			position = -1;
		if (classToSearch) {
			for (var i = 0; i < classList.length; i++) {
				if (classList[i] === classToSearch) {
					position = i;
				}
			}
		}
		return {
			list: classList,
			position: position
		}
	};

	/*
	 * Console log
	 * @type {function} @return {null}
	 */
	utils.cons = function(str) {
		try {
			console.log(str);
		} catch (e) {};
	};

	/*
	 * Event handler
	 * @type {function} @return {null}
	 */
	utils.on = function(element, eventType, handler) {
		element.addEventListener(eventType, handler, false);
	};

	/*
	 * Event Key handler
	 * @type {function} @return {null}
	 */
	utils.onKeyPress = function(element, keycode, handler) {
		utils.on(element, 'keydown', function(e) {
			var unicode = e.keyCode ? e.keyCode : e.charCode;
			if (utils.keyUp && unicode === keycode) {
				utils.keyUp = false;
				handler();
			}
		});
	};
	utils.keyUp = true;
	utils.on(window, 'keyup', function() {
		utils.keyUp = true;
	});

	/*
	 * Browser support for Mapy
	 * @type {boolean}
	 */
	var mapySupported = (utils.cssfix("perspective") !== null);

	/*
	 * Sel: DOM Nodes HANDLER
	 *********************************************/

	/*
	 * All interaction with DOM nodes is through this function
	 * @type {function} @return {object}
	 */
	utils.sel = function(selection, context) {
		var selectorNode = function(selection, context) {
			return this.init(selection, context);
		};
		selectorNode.prototype = {
			mapySelector: true,
			init: function(selection, context) {
				if (typeof selection === 'string') {
					var ctx = context || document;
					this.elem = utils.NodeListToArray(ctx.querySelectorAll(selection));
				} else {
					this.elem = [selection];
				}

				this.length = this.elem.length;

				this.id();

				var data = (typeof this.elem[0] !== 'undefined' && typeof document.body.dataset !== 'undefined') ? this.elem[0].dataset : {};
				this.t = {
					translate: {
						x: utils.toNumber(data.x),
						y: utils.toNumber(data.y),
						z: utils.toNumber(data.z)
					},
					rotate: {
						x: utils.toNumber(data.rotateX),
						y: utils.toNumber(data.rotateY),
						z: utils.toNumber(data.rotateZ || data.rotate)
					},
					scale: {
						x: utils.toNumber(data.scale, 1)
					},
					centered: false,
					perspective: 0
				};
				return this.transform();
			},
			id: function(str) {
				if (this.length > 0) {
					if (typeof str === 'string') {
						// Set
						this.elem[0].id = str;
						return this;
					} else {
						// Get
						var i = this.elem[0].id,
							idd;
						if (i === '' || i === undefined || i === null) {
							idd = this.elem[0].id = 'mapy-' + utils.idCounter++;
						} else {
							idd = i;
						}
						return idd;
					}
				}
			},
			node: function() {
				return this.elem[0];
			},
			toArray: function() {
				var a = [];
				for (var i = 0; i < this.length; i++) {
					var el = utils.sel(this.elem[i]);
					el.t.centered = true;
					el.transform();
					a.push(el);
				}
				return a;
			},
			centered: function(flag) {
				var fl = flag || true;
				this.t.centered = fl;
				return this;
			},
			append: function(el) {
				if (typeof el.mapySelector !== 'undefined') {
					var self = this;
					el.each(function(e) {
						self.elem[0].appendChild(e);
					});
				} else {
					this.elem[0].appendChild(el);
				}
				return this;
			},
			prepend: function(el) {
				if (typeof el.mapySelector !== 'undefined') {
					var self = this;
					el.each(function(e) {
						var first = self.elem[0].firstChild;
						if (first) {
							self.elem[0].insertBefore(e, first);
						} else {
							self.elem[0].appendChild(e);
						}
					});
				} else {
					var first = self.elem[0].firstChild;
					if (first) {
						self.elem[0].insertBefore(e, first);
					} else {
						self.elem[0].appendChild(e);
					}
				}
				return this;
			},
			appendTo: function(el) {
				if (typeof el.mapySelector !== 'undefined') {
					el.append(this);
				} else {
					utils.sel(el).append(this);
				}
				return this;
			},
			css: function(properties) {
				if (typeof properties === 'string') {
					// Get
					var sty = window.getComputedStyle(this.elem[0]),
						attr = sty.getPropertyValue(utils.computedCss(properties));
					if (attr === '' || attr === undefined || attr === null) {
						attr = sty.getPropertyValue(properties);
						if (attr === '' || attr === undefined || attr === null) {
							attr = sty.getPropertyValue(utils.cssfix(properties));
						}
					}
					return attr;
				} else {
					// Set
					var pk;
					for (k in properties) {
						pk = utils.cssfix(k);
						if (pk !== null) {
							this.each(function(el) {
								el.style[pk] = properties[k];
							});
						}
					}
					return this;
				}
			},
			each: function(handler) {
				for (var i = 0; i < this.length; i++) {
					handler(this.elem[i]);
				}
				return this;
			},
			transform: function(properties, reverse) {
				var rev = reverse || false;
				for (var a in properties) {
					props = properties[a];
					for (var b in props) {
						if (typeof this.t[a] !== 'undefined') {
							this.t[a][b] = props[b];
						}
					}
				}
				var strTransform = (this.t.perspective > 0) ? 'perspective(' + this.t.perspective + 'px) ' : '';
				if (rev) {
					strTransform += (this.t.scale.x === 1) ? '' : ' scale(' + this.t.scale.x + ')';
					strTransform += (this.t.rotate.z === 0 && this.t.rotate.y === 0 && this.t.rotate.x === 0) ? '' : ' rotateZ(' + this.t.rotate.z + 'deg) rotateY(' + this.t.rotate.y + 'deg) rotateX(' + this.t.rotate.x + 'deg)';
					strTransform += (this.t.translate.x === 0 && this.t.translate.y === 0 && this.t.translate.z === 0) ? '' : 'translate3d(' + this.t.translate.x + 'px,' + this.t.translate.y + 'px,' + this.t.translate.z + 'px)';
					strTransform += (this.t.centered) ? 'translate(-50%,-50%) ' : '';
				} else {
					strTransform += (this.t.centered) ? 'translate(-50%,-50%) ' : '';
					strTransform += (this.t.translate.x === 0 && this.t.translate.y === 0 && this.t.translate.z === 0) ? '' : 'translate3d(' + this.t.translate.x + 'px,' + this.t.translate.y + 'px,' + this.t.translate.z + 'px)';
					strTransform += (this.t.rotate.x === 0 && this.t.rotate.y === 0 && this.t.rotate.z === 0) ? '' : ' rotateX(' + this.t.rotate.x + 'deg) rotateY(' + this.t.rotate.y + 'deg) rotateZ(' + this.t.rotate.z + 'deg)';
					strTransform += (this.t.scale.x === 1) ? '' : ' scale(' + this.t.scale.x + ')';
				}
				if (mapySupported) {
					this.css({
						'transform': strTransform
					});
				}
				return this;
			},
			width: function() {
				return this.elem[0].offsetWidth;
			},
			height: function() {
				return this.elem[0].offsetHeight;
			},
			perspective: function(val) {
				this.t.perspective = val;
				return this.transform();
			},
			hasClass: function(str) {
				return (utils.classToData(this.elem[0], str).position !== -1);
			},
			addClass: function(str) {
				this.each(function(el) {
					var dataClass = utils.classToData(el, str);
					if (dataClass.position === -1) {
						el.className += ' ' + str;
					}
				});
				return this;
			},
			removeClass: function(str) {
				this.each(function(el) {
					var dataClass = utils.classToData(el, str);
					if (dataClass.position !== -1) {
						dataClass.list.splice(dataClass.position, 1);
						el.className = dataClass.list.join(' ');
					}
				});
				return this;
			},
			html: function(str) {
				if (typeof str === 'string') {
					this.each(function(el) {
						el.innerHTML = str;
					});
					return this;
				} else {
					return this.elem[0].innerHTML;
				}
			},
			attr: function(str, val) {
				if (typeof val === 'string') {
					this.each(function(el) {
						el.setAttribute(str, val);
					});
					return this;
				} else {
					return this.elem[0].getAttribute(str);
				}
			},
			show: function() {
				this.css({
					'display': 'block'
				});
				return this;
			},
			hide: function() {
				this.css({
					'display': 'none'
				});
				return this;
			}
		};

		return new selectorNode(selection, context);
	};

	/*
	 * MAPY
	 *********************************************/

	/* Custom events */
	var startChange = new CustomEvent(
			"startChange", {
				from: null,
				to: null,
				bubbles: true,
				cancelable: true
			}),
		finishChange = new CustomEvent(
			"finishChange", {
				from: null,
				to: null,
				bubbles: true,
				cancelable: true
			});

	/*
	 * Constructor
	 * @type {function} @return {object}
	 */
	var MC = function(options) {
			return this.init(options);
		},
		initialActions = [],

		/*
		 * Null copy of Mapy, for errors or exceptions
		 * @type {object}
		 */
		nullMapy = {
			changeStep: function() {},
			prevStep: function() {},
			nextStep: function() {},
			setup: function() {},
			slide: function() {}
		};

	/*
	 * MC prototype extension
	 */
	MC.prototype = {
		init: function(options) {

			/* Initial configuration
			 **************************************/
			this.config = utils.extendObject({
				id: null,
				margin: 20,
				perspective: 1000,
				duration: 1000,
				circular: true,
				initial: -1,
				panorama: true,
				hash: true,
				onInit: function() {}
			}, options);

			this.minStep = (this.config.panorama) ? -1 : 0;

			// if not id, select the first node with class 'mapy' and asign some random id
			if (this.config.id === null) {
				this.config.id = utils.sel('.mapy').id();
			}

			// For 'Edit Mode'. Default = false
			this.disable = false;

			// If it's running some transition
			this.animating = false;

			// Panorama setting
			this.panorama = {
				minX: 0,
				maxX: 0,
				minY: 0,
				maxY: 0,
				width: function() {
					return this.maxX - this.minX;
				},
				height: function() {
					return this.maxY - this.minY;
				},
				t: {
					translate: {
						x: 0,
						y: 0,
						z: 0
					},
					rotate: {
						x: 0,
						y: 0,
						z: 0
					},
					scale: {
						x: 1
					}
				}
			};

			/* DOM elements initial configuration
			 **************************************/

			// Store selections. Every selection's name start with '$' to easy recognizing
			this.$container = utils.sel('#' + this.config.id);

			if (mapySupported) {
				if (this.$container.length > 0) {
					this.$slides = utils.sel('.slide', this.$container.node()).centered();

					// Array of slides used to setup, navigate between slides, etc.
					this.slideList = this.$slides.toArray();
					this.length = this.slideList.length;
					this.stepList = [];
					for (var i = 0; i < this.length; i++) {
						if (this.slideList[i].hasClass('step')) {
							this.stepList.push(this.slideList[i]);
						}
					}
					this.stepLength = this.stepList.length;
					if (this.stepLength === 0) {
						this.stepList = this.slideList;
						this.stepLength = this.length;
					}

					// New node elements, to manage the visualization
					this.$scaler = utils.sel(document.createElement('div'));
					this.$moveRotater = utils.sel(document.createElement('div'));

					/* Add the new nodes to the main container, and wrap all slides
			 * @Structure:			 
			 $container
			 |_ _$scaler
			   |__$moveRotater
			   	 |__$slides			 
			 */
					this.$container.append(this.$scaler);
					this.$scaler.append(this.$moveRotater);
					this.$slides.appendTo(this.$moveRotater);

					/* Default CSS styles
					 **************************************/
					if (this.$container.css('position') === 'static') {
						this.$container.css({
							'position': 'relative'
						});
					};

					this.$scaler.perspective(this.config.perspective).css({
						'transform-style': 'preserve-3d',
						'transform-origin': 'left top 0',
						'transition': 'all ' + this.config.duration + 'ms',
						'position': 'absolute',
						'top': '50%',
						'left': '50%'
					});
					this.$moveRotater.css({
						'transform-style': 'preserve-3d',
						'transform-origin': 'left top 0',
						'transition': 'all ' + this.config.duration + 'ms',
						'position': 'absolute'
					});
					this.$slides.css({
						'transform-style': 'preserve-3d',
						'position': 'absolute'
					});

					/* Initial configuration for slider
					 **************************************/

					// Current slide showing. To init: config.initial or hash indication
					var idxHash = this.getIndexById(utils.hash().split('-')[0], true);
					this.current = (idxHash !== null) ? idxHash - 1 : this.config.initial - 1;

					// Set width and height of container, depending of window size
					this.setSizes()

					// Set Events
					.setEvents(this);

					this.$container.addClass('mapy-ready');
					utils.cons(':-) Mapy for #' + this.config.id + ' ready.');
					this.config.onInit();

					// trigger initial actions
					for (var i = 0; i < initialActions.length; i++) {
						if (typeof this[initialActions[i]] === 'function') {
							this[initialActions[i]]();
						}
					}

					return this;
				} else {
					utils.cons(':-( Sorry, there is not a selected element to run Mapy.');
					return nullMapy;
				}
			} else {
				this.$container.addClass('mapy-ready').addClass('mapy-not-supported');
				utils.cons(':-( Sorry, your browser does not support Mapy features.');
				return nullMapy;
			}

		},
		setSizes: function() {
			this.width = this.$container.width() - 2 * this.config.margin;
			this.height = this.$container.height() - 2 * this.config.margin;

			// Module of rectangle
			this.mod = this.width / this.height;
			return this;
		},
		changeStep: function(num) {
			if (!this.animating && this.current !== num && !this.disable) {
				var self = this;
				startChange.from = this.current;
				finishChange.from = this.current;

				startChange.to = num;
				finishChange.to = num;

				self.$container.node().dispatchEvent(startChange);

				this.current = num;
				this.animating = true;
				this.setZoom().setPosition();
				if (this.config.hash) {
					if (this.current >= 0) {
						utils.hash(this.stepList[this.current].id() + '-slide');
					} else {
						utils.hash('');
					}
				}

				setTimeout(function() {
					self.animating = false;
					self.$container.node().dispatchEvent(finishChange);
				}, this.config.duration);
			}
			return this;
		},
		prevStep: function() {
			var num = this.current - 1;
			if (num < this.minStep) {
				if (this.config.circular) {
					this.changeStep(this.stepLength - 1);
				}
			} else {
				this.changeStep(num);
			}
			return this;
		},
		nextStep: function() {
			var num = this.current + 1;
			if (num >= this.stepLength) {
				if (this.config.circular) {
					this.changeStep(this.minStep);
				}
			} else {
				this.changeStep(num);
			}

			return this;
		},
		gotoStep: function(num) {
			var n = utils.toNumber(num, -99);
			if (n >= this.minStep && n < this.stepLength) {
				this.changeStep(n);
			}
			return this;
		},
		setZoom: function(zoomOption) {
			var zoom;
			if (typeof zoomOption !== 'undefined') {
				zoom = zoomOption;
			} else {
				var slide = (this.current === -1) ? this.panorama : this.stepList[this.current];
				var width = slide.width(),
					height = slide.height(),
					mod = width / height,
					scale = slide.t.scale.x;
				zoom = (this.mod > mod) ? this.height / height / scale : this.width / width / scale;
			}

			this.$scaler.perspective(this.config.perspective / zoom).transform({
				scale: {
					x: zoom
				}
			}, true);

			return this;
		},
		setPosition: function(options) {

			if (typeof options !== 'undefined') {
				if (options.mode === 'translate') {
					this.$moveRotater.transform({
						translate: {
							x: options.x,
							y: options.y
						}
					}, true);
				} else {
					this.$moveRotater.transform({
						rotate: {
							z: options.z,
							x: options.x
						}
					}, true);
				}
			} else {
				var slide = (this.current === -1) ? this.panorama : this.stepList[this.current];
				var xt = -1 * slide.t.translate.x,
					yt = -1 * slide.t.translate.y,
					zt = -1 * slide.t.translate.z,
					xr = -1 * slide.t.rotate.x,
					yr = -1 * slide.t.rotate.y,
					zr = -1 * slide.t.rotate.z;
				this.$moveRotater.transform({
					translate: {
						x: xt,
						y: yt,
						z: zt
					},
					rotate: {
						x: xr,
						y: yr,
						z: zr
					}
				}, true);
			}
			return this;
		},
		setEvents: function(self) {
			utils.on(window, 'resize', function() {
				self.setSizes().setZoom();
			});

			utils.onKeyPress(window, 37, function() {
				self.prevStep();
			});
			utils.onKeyPress(window, 38, function() {
				self.prevStep();
			});
			utils.onKeyPress(window, 39, function() {
				self.nextStep();
			});
			utils.onKeyPress(window, 40, function() {
				self.nextStep();
			});

			for (var i = 0; i < this.stepLength; i++) {
				this.stepList[i].node().setAttribute('data-mapystep', i);
				utils.on(this.stepList[i].node(), 'click', function() {
					self.gotoStep(this.getAttribute('data-mapystep'));
				});
			}
			return this;
		},
		onStartChange: function(handler) {
			utils.on(this.$container.node(), 'startChange', handler);
			return this;
		},
		onFinishChange: function(handler) {
			utils.on(this.$container.node(), 'finishChange', handler);
			return this;
		},
		setup: function(props) {
			var p = props || [],
				l = (this.length < props.length) ? this.length : props.length;
			for (var i = 0; i < l; i++) {
				if (typeof p[i].id !== 'undefined') {
					this.slideList[this.getIndexById(p[i].id)].transform(p[i]);
				} else {
					this.slideList[i].transform(p[i]);
				}
			}
			// Start
			return this.setPanorama().changeStep(this.current + 1);
		},
		setPanorama: function() {
			this.panorama.minX = 9999999;
			this.panorama.maxX = -9999999;
			this.panorama.minY = 9999999;
			this.panorama.maxY = -9999999;
			for (var i = 0; i < this.length; i++) {
				var x = this.slideList[i].t.translate.x,
					y = this.slideList[i].t.translate.y,
					width = this.slideList[i].width(),
					height = this.slideList[i].height(),
					minX = x - width / 2,
					maxX = x + width / 2,
					minY = y - height / 2,
					maxY = y + height / 2;
				if (minX < this.panorama.minX) {
					this.panorama.minX = minX;
				}
				if (maxX > this.panorama.maxX) {
					this.panorama.maxX = maxX;
				}
				if (minY < this.panorama.minY) {
					this.panorama.minY = minY;
				}
				if (maxY > this.panorama.maxY) {
					this.panorama.maxY = maxY;
				}
			}
			this.panorama.t.translate.x = this.panorama.width() / 2 + this.panorama.minX;
			this.panorama.t.translate.y = this.panorama.height() / 2 + this.panorama.minY;
			return this;
		},
		getIndexById: function(id, onSteps) {
			var idx = null,
				onSt = onSteps || false,
				arr = (onSt) ? this.stepList : this.slideList;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].id() === id) {
					idx = i;
				}
			}
			return idx;
		},
		slide: function(i) {
			if (typeof i === 'string') {
				// ById
				return this.slideList[this.getIndexById(i)];
			} else {
				// By index position
				return this.slideList[i];
			}
		},
		step: function(i) {
			if (typeof i === 'string') {
				// ById
				return this.stepList[this.getIndexById(i, true)];
			} else {
				// By index position
				return this.stepList[i];
			}
		}
	};

	var Mapy = function(options) {
		return new MC(options);
	};

	Mapy.utils = utils;

	Mapy.extend = function() {
		return MC.prototype;
	};

	Mapy.onInit = function(ActionName) {
		initialActions.push(ActionName);
	};

	/*
	 * Public shortcut to Mapy
	 * @type {function} @return {object}
	 */
	window.Mapy = Mapy;

})();