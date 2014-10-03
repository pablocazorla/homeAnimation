;
(function() {
	if (!Mapy) {
		try {
			console.log(':-( There is not Mapy loaded.');
		} catch (e) {}
		return false;
	}

	var u = Mapy.utils,
		box = function(classname, container, text, tag, toPrepend) {
			var tagType = tag || 'div',
				b = u.sel(document.createElement(tagType));
			if (toPrepend) {
				container.prepend(b);
			} else {
				b.appendTo(container);
			}
			b.html(text).addClass(classname);
			return b;
		};

	Mapy.extend().editor = function() {

		var self = this,
			$grid = box('mapy-editor-grid', this.$moveRotater, '', 'div', true).hide(),
			$gridX = box('mapy-editor-grid-x', $grid, ''),
			$gridY = box('mapy-editor-grid-y', $grid, ''),
			$cursor = box('mapy-editor-cursor', this.$moveRotater, '').hide(),
			$cursor_circX = box('mapy-editor-cursor-circ-x', $cursor, ''),
			$cursor_circY = box('mapy-editor-cursor-circ-y', $cursor, ''),
			$cursor_circZ = box('mapy-editor-cursor-circ-z', $cursor, ''),
			$cursor_lineX = box('mapy-editor-cursor-line-x', $cursor, '<span>X</span>'),
			$cursor_lineY = box('mapy-editor-cursor-line-y', $cursor, '<span>Y</span>'),
			$cursor_lineZ = box('mapy-editor-cursor-line-z', $cursor, '<span>Z</span>'),
			$cursor_scale = box('mapy-editor-cursor-scale', $cursor, ''),
			$cursor_reset = box('mapy-editor-cursor-reset', $cursor, 'Reset'),
			$cursor_indicator = box('mapy-editor-cursor-indicator', this.$container, '<b>X : </b>45');


		$cursor.css({
			'transform-style': 'preserve-3d'
		});
		$cursor_circX.transform({
			rotate: {
				y: 90
			}
		});
		$cursor_circY.transform({
			rotate: {
				x: 90
			}
		});
		$cursor_lineY.transform({
			rotate: {
				z: 90
			}
		});
		$cursor_lineZ.transform({
			rotate: {
				x: 90,
				z: 90
			}
		});

		var $editor = box('mapy-editor', this.$container, ''),
			$btn = box('mapy-editor-btn', $editor, 'Editor').attr('title', 'Open editor'),
			$tools = box('mapy-editor-tools', $editor, '').hide(),
			$btnPanMouse = box('mapy-editor-tools-btn', $tools, 'Mouse Pan').addClass('to-pan').addClass('active'),
			$btnRotateMouse = box('mapy-editor-tools-btn', $tools, 'Mouse Rotate').addClass('to-rotate'),
			$btnResetMouse = box('mapy-editor-tools-btn', $tools, 'Reset View').addClass('to-reset'),

			$separator = box('mapy-editor-tools-separator', $tools, ''),
			$btnGetSetup = box('mapy-editor-tools-btn', $tools, 'Output Setup').addClass('to-setup'),
			$editorOutput = box('mapy-editor-output', this.$container, '').hide(),
			$editorOutputClose = box('mapy-editor-output-close', $editorOutput, 'x').attr('title', 'Close Output Setup'),
			$editorOutputContent = box('mapy-editor-output-content', $editorOutput, '<p style="font-size:11px;color:#666">Please, copy the code below and paste in your javascript app.<p>'),
			$editorOutputPre = box('mapy-editor-output-pre', $editorOutput, '', 'pre').css({
				'user-select': 'text'
			});


		var activeEdit = 0,

			editMode = false,
			setActive = function(num) {
				self.slideList[activeEdit].removeClass('active-edition');
				activeEdit = num;
				$cursor.transform({
					translate: {
						x: self.slideList[num].t.translate.x,
						y: self.slideList[num].t.translate.y,
						z: self.slideList[num].t.translate.z
					}
				});
				self.slideList[activeEdit].addClass('active-edition');
			},
			toggleEditMode = function() {
				if (!editMode) {
					self.$container.css({
						'user-select': 'none'
					}).addClass('mapy-on-edition');
					$grid.show();
					$cursor.show();
					$tools.show();
					self.disable = true;
					editMode = true;
					$btn.attr('title', 'Close editor');
					self.$moveRotater.css({
						'transition': 'none'
					});
					setActive(activeEdit);
				} else {
					self.$container.css({
						'user-select': 'auto'
					}).removeClass('mapy-on-edition');
					$grid.hide();
					$cursor.hide();
					$tools.hide();
					self.disable = false;
					editMode = false;
					$btn.attr('title', 'Open editor');
					self.$moveRotater.css({
						'transition': 'all ' + self.config.duration + 'ms'
					});
					self.setPanorama();
				}
			},
			mode = 'translate',
			setMode = function(m) {
				mode = m;
				if (mode === 'translate') {
					$btnRotateMouse.removeClass('active');
					$btnPanMouse.addClass('active');
				} else {
					$btnPanMouse.removeClass('active');
					$btnRotateMouse.addClass('active');
				}
			},
			dragging = false,
			outputOpen = false,

			xMouseInit = 0,
			yMouseInit = 0,

			xMoveRotaterInit = 0,
			yMoveRotaterInit = 0,
			zMoveRotaterInit = 0,

			optionsToMove = {
				mode: 'translate',
				x: 0,
				y: 0
			},
			activeCursor = null,
			posX, posY, posZ, rotX, rotY, rotZ, scaleX,
			isMoveRestricted = false,
			moveRestricted = function(val) {
				return (isMoveRestricted) ? Math.floor(val / 10) * 10 : val;
			},

			onMouseDown = function(e) {
				if (!dragging && editMode && !outputOpen) {
					dragging = true;
					xMouseInit = e.pageX;
					yMouseInit = e.pageY;

					optionsToMove.mode = mode;
					if (mode === 'translate') {
						xMoveRotaterInit = self.$moveRotater.t.translate.x;
						yMoveRotaterInit = self.$moveRotater.t.translate.y;
					} else {
						zMoveRotaterInit = self.$moveRotater.t.rotate.z;
						yMoveRotaterInit = self.$moveRotater.t.rotate.x;
					}

					// for activeCursor
					posX = self.slideList[activeEdit].t.translate.x;
					posY = self.slideList[activeEdit].t.translate.y;
					posZ = self.slideList[activeEdit].t.translate.z;
					rotX = self.slideList[activeEdit].t.rotate.x;
					rotY = self.slideList[activeEdit].t.rotate.y;
					rotZ = self.slideList[activeEdit].t.rotate.z;
					scaleX = self.slideList[activeEdit].t.scale.x;


				}
			},
			onMouseMove = function(e) {
				if (dragging && editMode) {
					if (activeCursor === null) {
						if (mode === 'translate') {
							optionsToMove.x = xMoveRotaterInit + (e.pageX - xMouseInit) / newZoom;
							optionsToMove.y = yMoveRotaterInit + (e.pageY - yMouseInit) / newZoom;
						} else {
							optionsToMove.z = zMoveRotaterInit - 0.2 * (e.pageX - xMouseInit);
							optionsToMove.x = yMoveRotaterInit - 0.2 * (e.pageY - yMouseInit);
						}
						self.setPosition(optionsToMove);
					} else {
						var dx = (e.pageX - xMouseInit),
							dy = (e.pageY - yMouseInit),
							dposX = posX,
							dposY = posY,
							dposZ = posZ,
							drotX = rotX,
							drotY = rotY,
							drotZ = rotZ,
							dscaleX = scaleX,
							indicatorContent;
						switch (activeCursor) {
							case 'lineX':
								dposX = moveRestricted(u.toNumber(Math.round(posX + Math.sqrt(dx * dx + dy * dy) * dx / Math.abs(dx) / newZoom)));
								indicatorContent = '<b>X : </b>' + dposX + 'px';
								break;
							case 'lineY':
								dposY = moveRestricted(u.toNumber(Math.round(posY + Math.sqrt(dx * dx + dy * dy) * dy / Math.abs(dy) / newZoom)));
								indicatorContent = '<b>Y : </b>' + dposY + 'px';
								break;
							case 'lineZ':
								dposZ = moveRestricted(u.toNumber(Math.round(posZ + Math.sqrt(dx * dx + dy * dy) * dy / Math.abs(dy) / newZoom)));
								indicatorContent = '<b>Z : </b>' + dposZ + 'px';
								break;
							case 'circX':
								drotX = moveRestricted(u.toNumber(Math.round(rotX + 0.2 * Math.sqrt(dx * dx + dy * dy) * dy / Math.abs(dy) / newZoom)));
								indicatorContent = '<b>rotX : </b>' + drotX + '°';
								break;
							case 'circY':
								drotY = moveRestricted(u.toNumber(Math.round(rotY + 0.2 * Math.sqrt(dx * dx + dy * dy) * dy / Math.abs(dy) / newZoom)));
								indicatorContent = '<b>rotY : </b>' + drotY + '°';
								break;
							case 'circZ':
								drotZ = moveRestricted(u.toNumber(Math.round(rotZ + 0.2 * Math.sqrt(dx * dx + dy * dy) * dy / Math.abs(dy) / newZoom)));
								indicatorContent = '<b>rotZ : </b>' + drotZ + '°';
								break;
							case 'scale':
								dscaleX = u.toNumber(0.01 * Math.floor(100 * (scaleX + 0.01 * Math.sqrt(dx * dx + dy * dy) * dy / Math.abs(dy) / newZoom)), 1);
								dscaleX = (dscaleX < 0.05) ? 0.05 : dscaleX;
								dscaleX = (dscaleX > 12) ? 12 : dscaleX;
								indicatorContent = '<b>Scale : </b>' + dscaleX;
								break;
						}
						var objTrans = {
							translate: {
								x: dposX,
								y: dposY,
								z: dposZ
							},
							rotate: {
								x: drotX,
								y: drotY,
								z: drotZ
							},
							scale: {
								x: dscaleX
							}
						};
						$cursor.transform({
							translate: {
								x: dposX,
								y: dposY,
								z: dposZ
							}
						});
						self.slideList[activeEdit].transform(objTrans);
						var rect = self.$container.node().getBoundingClientRect();
						$cursor_indicator.html(indicatorContent).css({
							'top': e.pageY - rect.top + 'px',
							'left': e.pageX - rect.left + 'px',
							'display': 'block'
						});
					}
				}
			},
			onMouseUp = function() {
				if (dragging) {
					dragging = false;
					$cursor_indicator.hide();
				}
			},
			zoomScale = 0.6,
			newZoom = self.$scaler.t.scale.x,
			onMouseWheel = function(e) {
				if (editMode) {
					var dir;
					if (typeof e.detail !== 'undefined') {
						dir = (e.detail > 0) ? zoomScale : 1 / zoomScale;
					} else {
						dir = (e.wheelDelta < 0) ? zoomScale : 1 / zoomScale;
					}
					newZoom = self.$scaler.t.scale.x * dir;
					newZoom = (newZoom < 0.1) ? 0.1 : newZoom;
					newZoom = (newZoom > 5) ? 5 : newZoom;
					self.setZoom(newZoom);
				}
			},
			getSetup = function() {
				var txt = 'Mapy("#' + self.config.id + '").setup([',
					t;
				for (var i = 0; i < self.length; i++) {
					txt += '{\n\tid: "' + self.slideList[i].id() + '",';
					t = self.slideList[i].t;
					if (t.translate.x !== 0 || t.translate.y !== 0 || t.translate.z !== 0) {
						txt += '\n\ttranslate: {';
						txt += (t.translate.x !== 0) ? '\n\t\tx: ' + t.translate.x + ',' : '';
						txt += (t.translate.y !== 0) ? '\n\t\ty: ' + t.translate.y + ',' : '';
						txt += (t.translate.z !== 0) ? '\n\t\tz: ' + t.translate.z : '';
						txt += '\n\t},';
					}
					if (t.rotate.x !== 0 || t.rotate.y !== 0 || t.rotate.z !== 0) {
						txt += '\n\trotate: {';
						txt += (t.rotate.x !== 0) ? '\n\t\tx: ' + t.rotate.x + ',' : '';
						txt += (t.rotate.y !== 0) ? '\n\t\ty: ' + t.rotate.y + ',' : '';
						txt += (t.rotate.z !== 0) ? '\n\t\tz: ' + t.rotate.z : '';
						txt += '\n\t},';
					}
					if (t.scale.x !== 1) {
						txt += '\n\tscale: {\n\t\tx: ' + t.scale.x + '\n\t}';
					}

					txt += '\n},\n';
				}
				txt += ']);';
				txt = txt.replace(/,\n\t}/g, '\n\t}');
				txt = txt.replace(/,\n}/g, '\n}');
				txt = txt.replace(/,\n]/g, ']');



				$editorOutputPre.html(txt);

				$editorOutput.show();
				outputOpen = true;

				var text = $editorOutputPre.node(),
					range, selection;
				if (document.body.createTextRange) {
					range = document.body.createTextRange();
					range.moveToElementText(text);
					range.select();
				} else if (window.getSelection) {
					selection = window.getSelection();
					range = document.createRange();
					range.selectNodeContents(text);
					selection.removeAllRanges();
					selection.addRange(range);
				}

			};

		u.on($btn.node(), 'click', toggleEditMode);

		u.on($btnPanMouse.node(), 'click', function() {
			setMode('translate');
		});
		u.on($btnRotateMouse.node(), 'click', function() {
			setMode('rotate');
		});
		u.on($btnResetMouse.node(), 'click', function() {
			self.$moveRotater.transform({
				translate: {
					x: 0,
					y: 0,
					z: 0
				},
				rotate: {
					x: 0,
					y: 0,
					z: 0
				}
			});
			self.$scaler.transform({
				scale: {
					x: 1
				}
			});
		});

		u.on($btnGetSetup.node(), 'click', function() {
			getSetup();
		});
		u.on($editorOutputClose.node(), 'click', function() {
			$editorOutput.hide();
			outputOpen = false;
		});

		u.on(this.$container.node(), 'mousedown', function(e) {
			onMouseDown(e);
		});
		u.on(window, 'mousemove', function(e) {
			onMouseMove(e);
		});
		u.on(window, 'mouseup', onMouseUp);

		u.on(window, 'DOMMouseScroll', function(e) {
			onMouseWheel(e);
		});
		u.on(window, 'mousewheel', function(e) {
			onMouseWheel(e);
		});

		u.on(window, 'keyup', function(e) {
			var unicode = e.keyCode ? e.keyCode : e.charCode;
			if (unicode === 16) {
				setMode('translate');
				isMoveRestricted = false;
			}
		});
		u.onKeyPress(window, 16, function() {
			setMode('rotate');
			isMoveRestricted = true;
		});

		u.on($cursor_lineX.node(), 'mousedown', function(e) {
			activeCursor = 'lineX';
			$cursor_lineX.addClass('active');
			$cursor.addClass('edit');
		});
		u.on($cursor_lineY.node(), 'mousedown', function(e) {
			activeCursor = 'lineY';
			$cursor_lineY.addClass('active');
			$cursor.addClass('edit');
		});
		u.on($cursor_lineZ.node(), 'mousedown', function(e) {
			activeCursor = 'lineZ';
			$cursor_lineZ.addClass('active');
			$cursor.addClass('edit');
		});
		u.on($cursor_circX.node(), 'mousedown', function(e) {
			activeCursor = 'circX';
			$cursor_circX.addClass('active');
			$cursor.addClass('edit');
		});
		u.on($cursor_circY.node(), 'mousedown', function(e) {
			activeCursor = 'circY';
			$cursor_circY.addClass('active');
			$cursor.addClass('edit');
		});
		u.on($cursor_circZ.node(), 'mousedown', function(e) {
			activeCursor = 'circZ';
			$cursor_circZ.addClass('active');
			$cursor.addClass('edit');
		});
		u.on($cursor_scale.node(), 'mousedown', function(e) {
			activeCursor = 'scale';
			$cursor_scale.addClass('active');
			$cursor.addClass('edit');
		});
		u.on($cursor_reset.node(), 'click', function(e) {
			$cursor.transform({
				translate: {
					x: 0,
					y: 0,
					z: 0
				}
			});
			self.slideList[activeEdit].transform({
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
			});
		});

		for (var i = 0; i < this.length; i++) {
			this.slideList[i].node().setAttribute('data-mapyslide', i);
			u.on(this.slideList[i].node(), 'click', function() {
				setActive(u.toNumber(this.getAttribute('data-mapyslide')));
			});
		}


		u.on(window, 'mouseup', function() {
			if (activeCursor !== null) {
				activeCursor = null;
				$cursor_circX.removeClass('active');
				$cursor_circY.removeClass('active');
				$cursor_circZ.removeClass('active');
				$cursor_lineX.removeClass('active');
				$cursor_lineY.removeClass('active');
				$cursor_lineZ.removeClass('active');
				$cursor_scale.removeClass('active');
				$cursor.removeClass('edit');
			}
		});
	};

	if (document.getElementById('mapy-editor-style') === null) {
		var sty = document.createElement('style');
		document.body.appendChild(sty);
		sty.id = 'mapy-editor-style';
		sty.innerHTML = '.mapy-editor{position:absolute;top:5px;right:5px;z-index:10000;font:10px/1.3em sans-serif;text-align:center;width:70px;padding:0;margin:0;background-color:#fff;color:#666;border:solid 1px #aaa;border-radius:4px}.mapy-editor-btn{font-size:11px;line-height:24px;font-weight:bold;cursor:pointer;color:#aaa;padding:0;margin:0}.mapy-editor-btn:hover{color:#666}.mapy-editor-tools{padding:0;margin:0}.mapy-editor-tools-btn{display:block;border-top:solid 1px #ccc;padding:40px 0 5px;cursor:pointer}.mapy-editor-tools-btn:hover{background-color:#aef;color:#000}.mapy-editor-tools-btn.active{background-color:#def}.mapy-editor-tools-separator{background-color:#ccc;padding:0;margin:0;height:5px}.mapy-editor-tools-btn.to-pan,.mapy-editor-tools-btn.to-rotate,.mapy-editor-tools-btn.to-reset,.mapy-editor-tools-btn.to-setup{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAADWCAYAAADPYJIBAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAZRSURBVHja7Jx5iFV1FMc/80bNBksNzbGxtCynzCmmPYPKSLM/LEuKIuIdWiDboGXaob1AihYKKiK/lJgt2F6ULbZTVLZJpJAMRqllE2VZOc7rj3se3q733rfMmyD6Hbj87ru/5fPO73fOucPvzO81lUolahEzGwPcD1wmaUW1/ZpqAZnZCOBjYDdgDbCfpO+r6VuoAXI40OMQgFbgOzM7pmEgM2sC9gMeA17wx0uAR4FOMys0dOoceiDwITBD0pJq+xWoXcZ5ObaWTvWAmhJl/SAzO9jMLq/jS2Bm15jZURVBbsLvAIdkjPWtl99l1HcAr5nZ2ExjMLN2t6qJwDPAwykDHQJ0AfcAb6TUnwacCHwPzJT0OcCgRKOHHAJwvF9Zcr5fWTLWzX/vNNB5wPNAG/Ai8HjKAAc44EGf4qTMAWa5c5+R6Udm1upqL5Y0J8ePpkt6NaX+UeAUYKKkbzKNQdIaYBrwacaU7OxlW0b9CmBWHJI2dWXYUmBpPeYt6dpGOWwpUQ5YZKjkR/UHVY/eFwOdwPZuVS8Da31NbpXU15DobWbTgVdSqmZLeqbRb9hW4CO3uB7ggKR1NWSN3PSn+rQdUS2krhdfvVLgX5IACqAACqAACqAACqAACqAACqAACqAACqD/HGhQfwcwsylEu/prgd+A4UCvpHVm1ixpM/RzL8izLH86oA9Y77PUDPwAHCSplKuRmc0E3pS0MYe1nWsz3D+P9HKZpAMrrpGZLQDmA9PMbHAOaARbJ0N6gJMrGoOZTSXa9m8F5gH754DaUsYYBpxvZi2ZIJ/zd2OP9gTW5YBGxu5f8nIwYMCkPI1OS3yeU2GXcUJs8JuA1f55ONAVn/Yk6M7Y/doqNmUnS2qS1At8CXwWq2uXtGkrkM/p8FjDsyqZt6TzYve/AE+yZeN9fzNrS9NoD7f/sqyow7V+ilnhHz6lW4E2udMB/OWOWKv8yD9TCj1Za9QbW9yJdYCmxjQqAL9ngTbHvs2UOkBXxO5XpxoD8DVRAqr8/BIz27GGuDcTGBV71JXlRyWitFt5+sYBt5nZdlVAdgeeS1jk06kgz5YsZku6puAx6w4zG2FmQzMgs4GvEgH6oGS7tBzfsUSp0XgwfRv4BFgIbPAp6gDOBSYnxpwv6YyKIIedDdzur4HytJat6QdgWw+eSUNaIMnSNM988ZmZAUXgsIR2SSkB3cDVkhZmNcp9w3oIOQk4GjgK+BXYwddjM7AcWOTTtSbPYGrJiO0DDPXQssmjwM9xX2kIKPxdF0ABFEABFEABFEABFEABFEABFEABFEABFED/X1DFHJ+ZjQJmE20MdhDtHvcRpRTeBRZJ+qjSOHlbnTsBVxLlgoZVGGcJcKOkt2sCmdlFRPmglpQ+K4n2USel1Am4VNL6XJBvpj8BHJMxyA2SVsU0voroPExceoAzJT2VCvLd+FeB8SmQ2yR1ebvxQHM5U2ZmVwE3p/SZJ+nyf4DMbG/gfbbsc8elW9IEH3QhcKo/fxY4QVKfmX3uhpKU57zN5oKZdRIlP7JyEA84pCsGATgOuMXv783oOwtYZmaTCkSnplpyLGqllzNS6spnwVbl9O8AFhR8MfOOi0zw8q2Uuve8HJfT/xtgbkHSW0SZrN6Mhmd7eRNbTiVCdGzoSr+fm9F3KbCvpI/jVtdJdHZlVEqH6yRd7+32BQqSlvnnC4C7U/rcJ2lulh+1EuWQDk3peJd7//qYz13hvhSXP4FzJKmayHAdkHYyqhf4wiPDZKJcRVwWAxdL6q4l1rX7tz2dyscdP3BtX6g5qMaA44lSO0cSJYVHu0ar3f8WSXq97ugd3rABFEABFEABFEABFEABFEABFEABFEABFEABFEBlqSbbshzYi+zN3dRxJRVqAgG7EJ2U2hUYUiVobc0aEf1v9wZJG6pVx8x661mjpho06ZcxDG4EqJqpu5DoVFv/pFQqbXUVi8XHi8XimLS6aq5isbgx+SztMNofRL/YNnB+ZGbrgCZJzQMGMrMeonN53Wa2iui0R5Z8LemIejUaHDPnbcg//TG0bo0kDXOtRktqGdCgKmkkMMjMes1s9IBGb0lDSP81xMb7UcInji8WizP660fVRIZHiE6vtQ50rOsjP6vZUNBf/wZoSB1+01xP9F4NtJvZxv6A/h4AJLK49LlxGfcAAAAASUVORK5CYII=);background-repeat:no-repeat}.mapy-editor-tools-btn.to-pan{background-position:center 14px}.mapy-editor-tools-btn.to-rotate{background-position:center -49px}.mapy-editor-tools-btn.to-reset{background-position:center -113px}.mapy-editor-tools-btn.to-setup{background-position:center -180px}.mapy-editor-grid{position:absolute;top:-1500px;left:-1500px;width:3000px;height:3000px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDY3ODc3RTI0MUU3MTFFNEFDNUNCNkU3Qzg3QUM0NzUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDY3ODc3RTM0MUU3MTFFNEFDNUNCNkU3Qzg3QUM0NzUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpENjc4NzdFMDQxRTcxMUU0QUM1Q0I2RTdDODdBQzQ3NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpENjc4NzdFMTQxRTcxMUU0QUM1Q0I2RTdDODdBQzQ3NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Puqs/UUAAAC0SURBVHja7NGxDQAgCEVBMe4Nm2tj4wQac68htP+iqmbTM419wxR3yszj7yZ5KyBABASIgAARECACAkRABASIgAARECACAkRABASIgAARECACAkRABASIgAARECACAkRABASIgAARECACAkRABASIgAARECACAkRABASIgAARECACAkRABASIgAARECACAkRABASIgAARECACAkRABASIgAARECACAkRAgAiIgAARkC9aAgwASRcEx0NS/QcAAAAASUVORK5CYII=);border-bottom:solid 1px gray;border-right:solid 1px gray}.mapy-editor-grid-x{position:absolute;top:1499px;left:0;width:3000px;height:2px;background-color:red}.mapy-editor-grid-y{position:absolute;left:1499px;top:0;height:3000px;width:2px;background-color:#0b0}.mapy-editor-cursor{position:absolute;top:0;left:0;z-index:11000}.mapy-editor-cursor:not(.edit):hover div{opacity:.4}.mapy-editor-cursor-circ-x,.mapy-editor-cursor-circ-y,.mapy-editor-cursor-circ-z{position:absolute;top:-114px;left:-114px;width:200px;height:200px;border-style:solid;border-width:14px;border-radius:150px}.mapy-editor-cursor-circ-x{border-color:red}.mapy-editor-cursor-circ-y{border-color:#0b0}.mapy-editor-cursor-circ-z{border-color:#00f}.mapy-editor-cursor-line-x,.mapy-editor-cursor-line-y,.mapy-editor-cursor-line-z{position:absolute;top:-7px;left:-200px;width:400px;height:14px;border-radius:10px}.mapy-editor-cursor-line-x span,.mapy-editor-cursor-line-y span,.mapy-editor-cursor-line-z span{position:absolute;top:-17px;left:10px}.mapy-editor-cursor-line-x{background-color:red}.mapy-editor-cursor-line-y{background-color:#0b0}.mapy-editor-cursor-line-z{background-color:#00f}.mapy-editor-cursor-scale{position:absolute;top:-30px;left:-30px;width:60px;height:60px;background-color:#d90;border-radius:40px;opacity:.7;border:solid 2px #960}.mapy-editor-cursor-reset{position:absolute;top:110px;left:110px;padding:0 5px;background-color:#fff;font-size:12px;line-height:20px;border:solid 2px #bbb;border-radius:10px;cursor:pointer}.mapy-editor-cursor:not(.edit):hover div.mapy-editor-cursor-circ-x:hover,.mapy-editor-cursor:not(.edit):hover div.mapy-editor-cursor-circ-y:hover,.mapy-editor-cursor:not(.edit):hover div.mapy-editor-cursor-circ-z:hover{opacity:1;border-color:#dd0}.mapy-editor-cursor:not(.edit):hover div.mapy-editor-cursor-line-x:hover,.mapy-editor-cursor:not(.edit):hover div.mapy-editor-cursor-line-y:hover,.mapy-editor-cursor:not(.edit):hover div.mapy-editor-cursor-line-z:hover,.mapy-editor-cursor:not(.edit):hover div.mapy-editor-cursor-scale:hover,.mapy-editor-cursor:not(.edit):hover div.mapy-editor-cursor-reset:hover{opacity:1;background-color:#dd0}.mapy-editor-cursor-line-x.active,.mapy-editor-cursor-line-y.active,.mapy-editor-cursor-line-z.active{background-color:#dd0}.mapy-editor-cursor-circ-x.active,.mapy-editor-cursor-circ-y.active,.mapy-editor-cursor-circ-z.active{border-color:#dd0}.mapy-on-edition .active-edition{box-shadow:0 0 5px 10px rgba(0,20,200,1),inset 0 0 2px 4px rgba(255,255,255,.5)}.mapy-editor-cursor-indicator{position:absolute;padding:5px 10px;font-size:11px;line-height:12px;margin:-40px 0 0 -10px;background-color:#fff;border:#bbb solid 1px;border-radius:4px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.2)}.mapy-editor-output{position:absolute;top:4px;bottom:4px;right:4px;z-index:12000;width:350px;padding:10px;border:solid 1px #bbb;background-color:#fff}.mapy-editor-output pre{position:absolute;top:60px;bottom:10px;left:10px;right:10px;background-color:#eee;border:solid 1px #bbb;overflow-y:scroll}.mapy-editor-output-close{width:20px;height:20px;position:absolute;top:4px;right:4px;cursor:pointer;color:#999;font:20px/20px sans-serif}.mapy-editor-output-close:hover{color:#333}';
	};
	Mapy.onInit('editor');
})();