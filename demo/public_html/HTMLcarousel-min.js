/*!
 *  HTML IMAGE CAROUSEL
 *
 *  1.2
 *
 *  author: Carlo J. Santos
 *  email: carlosantos@gmail.com
 *  documentation: https://github.com/nargalzius/HTMLvideo
 *
 *  Copyright (c) 2017, All Rights Reserved, www.nargalzius.com
 */

var Carousel = function(){};

Carousel.prototype = {
	debug: true,
	loop: true,
	currentSlide: 0,
	currentInfo: null,
	clickable: true,
	mode: 1,
	screenflow: {
		width: null,
		height: null,
		smaller: null,
		buffer: -30,
		fade: 0.7
	},
	active: true,
	arrows: {
		size: 64,
		margin: 0
	},
	slide: 'cover',
	ismobile: null,
	desktopAgents: [
		'desktop'
	],

	svg: {
		prev: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="48" height="48" viewBox="0 0 48 48"><path d="M30.844 14.813l-9.188 9.188 9.188 9.188-2.813 2.813-12-12 12-12z"></path></svg>',
		next: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="48" height="48" viewBox="0 0 48 48"><path d="M19.969 12l12 12-12 12-2.813-2.813 9.188-9.188-9.188-9.188z"></path></svg>',
		spin: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="0 0 32 32"><path d="M16 0c-8.711 0-15.796 6.961-15.995 15.624 0.185-7.558 5.932-13.624 12.995-13.624 7.18 0 13 6.268 13 14 0 1.657 1.343 3 3 3s3-1.343 3-3c0-8.837-7.163-16-16-16zM16 32c8.711 0 15.796-6.961 15.995-15.624-0.185 7.558-5.932 13.624-12.995 13.624-7.18 0-13-6.268-13-14 0-1.657-1.343-3-3-3s-3 1.343-3 3c0 8.837 7.163 16 16 16z"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" begin="0" dur="1s" repeatCount="indefinite" /></path></svg>'
	},

	colors_container: '#000',
	colors_prev: '#FFF',
	colors_next: '#FFF',
	colors_spin: '#FFF',
	colors_net: 'rgba(0,0,0,0.3)',

	dom_container: null,
	dom_slides: null,
	dom_net: null,
	dom_prev: null,
	dom_next: null,
	dom_spin: null,

	// control_registry: [],
	imageData: [],
	imageInfo: [],
	dom_index: {
		prev: null,
		now: null,
		next: null
	},

	checkForMobile: function() {

		var mobileFlag = true;

		for (var i = 0; i < this.desktopAgents.length; i++) {
			var regex;
				regex = new RegExp(this.desktopAgents[i], "i");

			if( window.document.documentElement.className.match(regex) ) {
				mobileFlag = false;
			}
		}

		if( mobileFlag ) {
			this.ismobile = true;
			this.trace("mobile browser detected");
		} else {
			this.ismobile = false;
			this.trace("desktop browser detected");
		}
	},

	dom_template_prev: function() {
		this.dom_prev = document.createElement('div');
		this.dom_prev.innerHTML = this.svg.prev;
		this.dom_prev.getElementsByTagName('path')[0].style.fill = this.colors_prev;
		this.dom_prev.getElementsByTagName('svg')[0].style.height = this.arrows.size;
		this.dom_prev.getElementsByTagName('svg')[0].style.width = this.arrows.size;
	},

	dom_template_next: function() {
		this.dom_next = document.createElement('div');
		this.dom_next.innerHTML = this.svg.next;
		this.dom_next.getElementsByTagName('path')[0].style.fill = this.colors_next;
		this.dom_next.getElementsByTagName('svg')[0].style.height = this.arrows.size;
		this.dom_next.getElementsByTagName('svg')[0].style.width = this.arrows.size;
	},

	dom_template_spin: function() {
		this.dom_spin = document.createElement('div');
		this.dom_spin.innerHTML = this.svg.spin;
		this.dom_spin.getElementsByTagName('path')[0].style.fill = this.colors_spin;
	},

	init: function(obj, imgarray, infoarray) {
	// init: function(obj, imgarray) {

		var self = this;
		
		for(var p in imgarray) {
			this.imageData.push(imgarray[p]);
		}

		if(this.mode === 3 && this.imageData.length < 3) {
			alert('You need at least three imageData for mode 3. Switching to default (1)');
			this.mode = 1;
		}

		if(infoarray) {
			for(var q in infoarray) {
				this.imageInfo.push(infoarray[q]);
			}
		}

		if(this.ismobile === null) { this.checkForMobile(); }

		if(typeof obj === 'object') {
			this.dom_container = document.getElementById( obj.id );
		} else {
			this.dom_container = document.getElementById( obj );
		}

		if(this.ismobile) {
			this.swipedetect(this.dom_container, function(e){
				switch(e) {
					case "left":
						self.nextSlide();
					break;
					case "right":
						self.prevSlide();
					break;
					case "up":
						if(self.mode === 0) {
							self.nextSlide();
						}
					break;
					case "down":
						if(self.mode === 0) {
							self.prevSlide();
						}
					break;
				}
			});
		}

		var container_position = window.getComputedStyle(this.dom_container).getPropertyValue('position');

		// console.log(container_position);

		if(container_position === 'static') {
			this.dom_container.style.position = 'relative';
		}

		this.dom_container.style.backgroundColor = this.colors_container;
		this.dom_container.style.overflow = 'hidden';

		if( document.defaultView && document.defaultView.getComputedStyle ) {
			var s = document.defaultView.getComputedStyle( this.dom_container, '' );
			this.zindex = parseInt( s.getPropertyValue('z-index'), 50 );
		} else if( this.dom_container.currentStyle ) {
			this.zindex = parseInt( this.dom_container.currentStyle.zIndex, 50 );
		}

		if(!this.zindex) {
			this.zindex = 0;
			this.trace("z-index for video container element not detected, make sure position property is set.\nzIndex set to 0");
		}

		// GENERATE DOM ELEMENTS

		this.dom_slides = document.createElement('div');
		this.dom_slides.className = 'slides';
		this.dom_slides.style.position = 'relative';
		this.dom_slides.style.height = '100%';
		this.dom_slides.style.width = '100%';
		this.dom_slides.style.top = 0;
		this.dom_slides.style.left = 0;
		this.dom_slides.style.display = 'block';
		this.dom_slides.style.zIndex = this.zindex + 1;
		this.dom_container.appendChild(this.dom_slides);


		this.dom_template_prev();
		this.addClass(this.dom_prev, 'cbtn');
		this.addClass(this.dom_prev, 'prev');
		this.dom_prev.style.zIndex = this.zindex + 6;
		this.dom_prev.style.display = 'block';
		this.dom_prev.style.position = 'absolute';
		this.dom_prev.style.cursor = 'pointer';
		this.dom_prev.style.opacity = 0;
		this.dom_prev.onclick = function() {
			self.prevSlide();
		};
		this.dom_container.appendChild(this.dom_prev);

		this.dom_template_next();
		this.addClass(this.dom_next, 'cbtn');
		this.addClass(this.dom_next, 'next');
		this.dom_next.style.zIndex = this.zindex + 6;
		this.dom_next.style.display = 'block';
		this.dom_next.style.position = 'absolute';
		this.dom_next.style.cursor = 'pointer';
		this.dom_next.style.opacity = 0;
		this.dom_next.onclick = function() {
			self.nextSlide();
		};
		this.dom_container.appendChild(this.dom_next);

		// this.dom_net = document.createElement('div');
		// this.dom_net.style.position = 'absolute';
		// this.dom_net.style.display = 'block';
		// this.dom_net.style.display = 'none';
		// this.dom_net.style.width = '100%';
		// this.dom_net.style.height = '100%';
		// this.dom_net.style.top = '0';
		// this.dom_net.style.left = '0';
		// this.dom_net.style.backgroundColor = this.colors_net;
		// this.dom_net.style.opacity = 0;
		// this.dom_net.style.zIndex = this.zindex + 7;
		// this.dom_container.appendChild(this.dom_net);

		this.dom_template_spin();
		this.addClass(this.dom_spin, 'spin');
		this.dom_spin.style.zIndex = this.zindex + 8;
		this.dom_spin.style.display = 'block';
		this.dom_spin.style.opacity = 0;
		this.dom_spin.style.visibility = 'visible';
		this.dom_spin.style.position = 'absolute';
		this.dom_container.appendChild(this.dom_spin);
		this.reflow();


		setTimeout(function(){
			self.setVendor(self.dom_prev, 'Transition', 'all 0.3s ease-In');
			self.setVendor(self.dom_next, 'Transition', 'all 0.3s ease-In');
			self.setVendor(self.dom_spin, 'Transition', 'all 0.3s ease-In');

			// self.setVendor(self.dom_net, 'Transition', 'all 0.3s ease-In');			

			self.setVendor(self.dom_prev, 'Filter', 'drop-shadow( 1px 1px 1px rgba(0,0,0,0.5) )');
			self.setVendor(self.dom_next, 'Filter', 'drop-shadow( -1px 1px 1px rgba(0,0,0,0.5) )');
			self.setVendor(self.dom_spin, 'Filter', 'drop-shadow( 0px 1px 1px rgba(0,0,0,0.5) )');

			self.active = false;
			self.wait(1);
			self.loadSlide(0);
		}, 600);
	},

	prevSlide: function() {

		if(this.active) {
			this.loadSlide(0, 0);
			this.currentSlide--;

			if(this.currentSlide < 0) {
				this.currentSlide = this.imageData.length-1;
			}

			this.trace(this.currentSlide);
		}
	},

	nextSlide: function() {

		if(this.active) {
			this.loadSlide(0, 1);
			this.currentSlide++;

			if( this.currentSlide > this.imageData.length - 1) {
				this.currentSlide = 0;
			}

			this.trace(this.currentSlide);
		}
	},

	checkEdges: function() {

		this.trace('loop: '+this.loop);

		if(this.loop) {
			this.toggle(this.dom_prev, 1);
			this.toggle(this.dom_next, 1);
		} else {
			if(this.currentSlide === 0 ) {
				this.toggle(this.dom_prev, 0);
			} else {
				this.toggle(this.dom_prev, 1);
			}

			if( this.currentSlide === ( this.imageData.length - 1 ) ) {
				this.toggle(this.dom_next, 0);
			} else {
				this.toggle(this.dom_next, 1);
			}
		}

	},

	loadSlide: function(number, bool) {

		var self = this;
		var num = number+1;
		var parent = this.dom_slides;
		var dir = (bool) ? 'right' : 'left';

		this.wait(1);

		var limage;

		// EVALUATE REGULAR SLIDESHOW OR SCREENFLOW

		if(!this.dom_index.next) {
			this.trace('first time');

			// SET IMAGE ARRAY TO HAVE PREVOIUS AS 0, CURRENT AS 1, AND NEXT AS 2
			this.arrayRotate(this.imageData, true);

			if(this.imageInfo.length) {
				this.arrayRotate(this.imageInfo, true);
			}

			if(this.mode === 3) {

				limage = [
					this.imageData[0],
					this.imageData[1],
					this.imageData[2]
				];

			} else {
				limage = this.imageData[1];
			}

		} else {
			this.trace('no longer first');

			if(dir === 'left') {
				this.arrayRotate(this.imageData, true);
				
				if(this.imageInfo.length) {
					this.arrayRotate(this.imageInfo, true);
				}
			} else {
				this.arrayRotate(this.imageData);

				if(this.imageInfo.length) {
					this.arrayRotate(this.imageInfo);
				}
			}

			if(this.mode === 3) {
				num = (dir === 'left') ? 0 : 2;
			} else {
				num = 1;
			}

			limage = this.imageData[num];
		}

		if(this.imageInfo.length) {
			this.currentInfo = this.imageInfo[1];
		}

		this.load(limage, function(){

			self.wait(0);
			self.callback_show();

			var slide_next = (self.dom_index.next) ? self.dom_index.next : null;
			var slide_prev = (self.dom_index.prev) ? self.dom_index.prev : null;
			var slide_now = (self.dom_index.now) ? self.dom_index.now : null;
			var to;
			var from;

			// SCREENFLOW STUFF
			var mW;
			var mH;
			var x_center;
			var p_smaller;
			var p_xsmall;
			var x_left;
			var x_right;
			var xx_left;
			var xx_right;

			if(self.mode === 3 && (slide_next || slide_now || slide_prev)) {
				num = (dir === 'left') ? 0 : 2;
			}

			var slide = document.createElement('div');
				slide.style.position = 'absolute';
				slide.style.backgroundImage = 'url('+self.imageData[num]+')';
				slide.style.backgroundRepeat = 'no-repeat';
				slide.style.backgroundPosition = 'center';
				slide.style.zIndex = self.zindex + 5;
				slide.style.opacity = 0;
				slide.style.backgroundSize = self.slide;

			if(self.mode !== 3) {
				slide.style.width = '100%';
				slide.style.height = '100%';
			}

			self.setVendor(slide, 'Transition', 'all 0.3s ease-In');
			parent.appendChild(slide);

			if(!slide_next && self.mode !== 3) {

				setTimeout(function(){
					slide.style.left = 0;
					slide.style.opacity = 1;
					self.dom_index.next = slide;

					self.assignClicks();

					self.active = true;
				}, 50);
			}

			switch(self.mode) {
				case 1:
					// SLIDE

					to = (dir === 'left') ? self.dom_container.offsetWidth : self.dom_container.offsetWidth * -1;
					from = (dir === 'left') ? self.dom_container.offsetWidth * -1 : self.dom_container.offsetWidth;

					if(slide_next) {
						slide.style.opacity = 1;
						slide.style.left = from + 'px';
						setTimeout(function(){
							slide.style.left = '0px';
							slide_next.style.left = to + 'px';

							setTimeout(function(){
								slide_next.parentNode.removeChild(slide_next);
								self.dom_index.next = slide;

								self.assignClicks();

								self.active = true;
							}, 500);
						}, 200);
					}
				break;
				case 2:
					// REVEAL

					to = (dir === 'left') ? self.dom_container.offsetWidth : self.dom_container.offsetWidth * -1;
					from = (dir === 'left') ? self.dom_container.offsetWidth * -1 : self.dom_container.offsetWidth;

					if(slide_next) {
						slide_next.style.zIndex = self.zindex + 5;
						slide.style.zIndex = self.zindex + 4;
						slide.style.opacity = 1;
						slide.style.left = '0px';

						setTimeout(function(){
							slide_next.style.left = to + 'px';

							setTimeout(function(){
								slide_next.parentNode.removeChild(slide_next);
								self.dom_index.next = slide;

								self.assignClicks();

								self.active = true;
							}, 500);
						}, 500);
					}
				break;
				case 3:

					// SCREENFLOW

					mW = ( self.screenflow.width ) ? self.screenflow.width : self.dom_container.offsetHeight;
					mH = ( self.screenflow.height ) ? self.screenflow.height : self.dom_container.offsetHeight;
					x_center = ( self.dom_container.offsetWidth - mW ) / 2;
					p_smaller = ( self.screenflow.smaller ) ? self.screenflow.smaller : 0.7;
					p_xsmall = ( self.screenflow.smaller ) ? self.screenflow.smaller * self.screenflow.smaller : (0.7 * 0.7) ;

					slide.style.width = mW + 'px';
					slide.style.height = mH + 'px';


					if(slide_prev || slide_now || slide_next) {

						x_left = slide_prev.offsetLeft;
						x_right = slide_next.offsetLeft;
						xx_left = slide_prev.offsetLeft - mW*p_smaller;
						xx_right = slide_next.offsetLeft + mW*p_smaller;

						slide.style.width = mW + 'px';
						slide.style.height = mH + 'px';
						slide.style.opacity = 0;
						self.setVendor(slide, 'Transform', 'scale('+p_xsmall+')');
						parent.appendChild(slide);
						slide.style.left = ( (dir === 'left') ? xx_left : xx_right ) + 'px';


						// SHIFT EVERYTHING

						setTimeout(function(){

							if(dir === 'left') {
								slide_next.style.left = xx_right + 'px';
								slide_next.style.opacity = 0;
								slide_next.style.zIndex = self.zindex + 3;
								self.setVendor(slide_next, 'Transform', 'scale('+p_xsmall+')');

								slide_now.style.left = x_right + 'px';
								slide_now.style.opacity = self.screenflow.fade;
								self.setVendor(slide_now, 'Transform', 'scale('+p_smaller+')');

								slide_prev.style.left = x_center + 'px';
								slide_prev.style.opacity = 1;
								self.setVendor(slide_prev, 'Transform', 'scale(1.0)');

								slide.style.left = x_left + 'px';
								slide.style.opacity = self.screenflow.fade;
								slide.style.zIndex = self.zindex + 3;
								self.setVendor(slide, 'Transform', 'scale('+p_smaller+')');

								setTimeout(function(){
									slide_prev.style.zIndex = self.zindex + 6;
								}, 50);

								setTimeout(function(){
									slide_next.parentNode.removeChild(slide_next);

									slide_now.style.zIndex = self.zindex + 4;
									slide_prev.style.zIndex = self.zindex + 5;

									self.dom_index.prev = slide;
									self.dom_index.now = slide_prev;
									self.dom_index.next = slide_now;

									self.assignClicks();

									self.active = true;
								},500);

							} else {
								slide_prev.style.left = xx_left + 'px';
								slide_prev.style.zIndex = self.zindex + 3;
								self.setVendor(slide_prev, 'Transform', 'scale('+p_xsmall+')');

								slide_now.style.left = x_left + 'px';
								slide_now.style.opacity = self.screenflow.fade;
								self.setVendor(slide_now, 'Transform', 'scale('+p_smaller+')');

								slide_next.style.left = x_center + 'px';
								slide_next.style.opacity = 1;
								self.setVendor(slide_next, 'Transform', 'scale(1.0)');

								slide.style.left = x_right + 'px';
								slide.style.opacity = self.screenflow.fade;
								slide.style.zIndex = self.zindex + 3;
								self.setVendor(slide, 'Transform', 'scale('+p_smaller+')');

								setTimeout(function(){
									slide_next.style.zIndex = self.zindex + 6;
								}, 50);

								setTimeout(function(){
									slide_prev.parentNode.removeChild(slide_prev);

									slide_now.style.zIndex = self.zindex + 4;
									slide_next.style.zIndex = self.zindex + 5;

									self.dom_index.prev = slide_now;
									self.dom_index.now = slide_next;
									self.dom_index.next = slide;

									self.assignClicks();

									self.active = true;

								},500);

							}
						}, 50);

					} else {

						var left = document.createElement('div');
							left.style.position = 'absolute';
							left.style.backgroundImage = 'url('+self.imageData[num-1]+')';
							left.style.backgroundRepeat = 'no-repeat';
							left.style.backgroundPosition = 'center';
							left.style.zIndex = self.zindex + 4;
							left.style.opacity = 0;
							left.style.width = mW + 'px';
							left.style.height = mH + 'px';
							left.style.backgroundSize = self.slide;
							self.setVendor(left, 'Transition', 'all 0.3s ease-In');
							self.setVendor(left, 'Transform', 'scale('+p_smaller+')');
							parent.appendChild(left);

						var right = document.createElement('div');
							right.style.position = 'absolute';
							right.style.backgroundImage = 'url('+self.imageData[num+1]+')';
							right.style.backgroundRepeat = 'no-repeat';
							right.style.backgroundPosition = 'center';
							right.style.zIndex = self.zindex + 4;
							right.style.opacity = 0;
							right.style.width = mW + 'px';
							right.style.height = mH + 'px';
							right.style.backgroundSize = self.slide;
							self.setVendor(right, 'Transition', 'all 0.3s ease-In');
							self.setVendor(right, 'Transform', 'scale('+p_smaller+')');
							parent.appendChild(right);

						x_left = x_center - ( left.offsetWidth + self.screenflow.buffer );
						x_right = x_center + mW + self.screenflow.buffer;

							left.style.left = x_left + 'px';
							right.style.left = x_right + 'px';

						slide.style.left = x_center + 'px';

						setTimeout(function(){
							slide.style.opacity = 1;
							left.style.opacity = self.screenflow.fade;
							right.style.opacity = self.screenflow.fade;
							self.dom_index.now = slide;
							self.dom_index.prev = left;
							self.dom_index.next = right;

							self.assignClicks();

							self.active = true;

						}, 50);
					}

				break;
				default:
					// FADE
					if(slide_next) {

						slide_next.style.zIndex = self.zindex + 4;

						setTimeout(function(){
							slide.style.opacity = 1;
						}, 50);
						setTimeout(function(){
							slide_next.parentNode.removeChild(slide_next);
							self.dom_index.next = slide;

							self.assignClicks();

							self.active = true;
						}, 500);
					}
			}
			self.checkEdges();
		});


	},

	assignClicks: function() {

		var self = this;

		if(this.mode === 3) {
			this.dom_index.prev.style.cursor = 'default';
			this.dom_index.prev.onclick = function() {
				if(self.loop || self.currentSlide !== 0 && self.active) {
					self.prevSlide();
				}

			};

			this.dom_index.next.style.cursor = 'default';
			this.dom_index.next.onclick = function() {
				if(self.loop || self.currentSlide !== self.imageData.length-1 && self.active) {
					self.nextSlide();
				}
			};

			if(this.clickable) {
				this.dom_index.now.style.cursor = 'pointer';
			}
			this.dom_index.now.onclick = function() {
				if(self.clickable && self.active) {
					self.callback_click();
				}
			};
		} else {
			if(this.clickable) {
				this.dom_index.next.style.cursor = 'pointer';
			}
			this.dom_index.next.onclick = function() {
				if(self.clickable && self.active) {
					self.callback_click();
				}
			};
		}
	},

	callback_show: function() {
		this.trace('callback_show');
	},

	callback_click: function() {
		this.trace('callback_click');
	},

	toggle: function(obj, bool) {
		if(bool) {
			obj.style.opacity = 0;
			obj.style.display = 'block';
			setTimeout(function(){
				obj.style.opacity = 1;
			}, 50);
		} else {
			obj.style.opacity = 0;
			setTimeout(function(){
				obj.style.display = 'none';
			}, 300);
		}
	},

	wait: function(bool) {

		this.active = false;

		if(bool) {
			this.toggle(this.dom_spin, 1);
			// this.toggle(this.dom_net, 1);
		} else {
			this.toggle(this.dom_spin, 0);
			// this.toggle(this.dom_net, 0);
		}

	},

	get: function(str) {
		return document.querySelector(str);
	},

	reflow: function() {

		this.dom_spin.style.top = '50%';
		this.dom_spin.style.marginTop = ( Number( this.dom_spin.offsetHeight / 2 ) * -1 ) + 'px';
		this.dom_spin.style.left = '50%';
		this.dom_spin.style.marginLeft = ( Number( this.dom_spin.offsetWidth / 2 ) * -1 ) + 'px';

		this.dom_prev.style.top = '50%';
		this.dom_prev.style.marginTop = ( Number( this.dom_prev.offsetHeight / 2 ) * -1 ) + 'px';
		this.dom_prev.style.left = this.arrows.margin+'px';

		this.dom_next.style.top = '50%';
		this.dom_next.style.marginTop = ( Number( this.dom_next.offsetHeight / 2 ) * -1 ) + 'px';
		this.dom_next.style.right = this.arrows.margin+'px';


	},

	setVendor: function(element, property, value) {
		element.style["webkit" + property] = value;
		element.style["moz" + property] = value;
		element.style["ms" + property] = value;
		element.style["o" + property] = value;
	},

	load: function(arg, callback) {
		switch(typeof arg)
		{
			case "object":
				var lcounter  = 0;

				var onload = function() {
					if(++lcounter === arg.length && callback) {
						callback();
					}
				};

				var onerror = function(e) { if(console) { console.log(e); } };

				for(var i = 0; i < arg.length; i++)
				{
					var imgs = new Image();
						imgs.onload = onload;
						imgs.onerror = onerror;
						imgs.src = arg[i];
				}
			break;
			default:
				var img = new Image();
					img.onload = function(){
						callback();
					};
					img.onerror = function(e) { if(window.console) { console.log(e); } };
					img.src = arg;
		}
	},

	arrayRotate: function(arr, reverse){
		if(reverse) {
			arr.unshift(arr.pop());
			this.trace('array shifted left');
		}
		else {
			arr.push(arr.shift());
			this.trace('array shifted right');
		}
		return arr;
	},

	trace: function(str) {

		if(this.debug) {

			if(window.console) {
				window.console.log(str);
			}

			if( this.dom_debug ) {
				this.dom_debug.innerHTML += str + '<br>';
			}
		}
	},

	addClass: function(el, className) {
		if (el.classList) {
			el.classList.add(className);
		} else {
			el.className += ' ' + className;
		}
	},

	removeClass: function(el, className) {
		if (el.classList) {
			el.classList.remove(className);
		} else {
			el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	},

	swipedetect: function(el, callback){

		var touchsurface = el;
		var swipedir;
		var startX;
		var startY;
		var distX;
		var distY;
		var dist;
		var threshold = 150; //required min distance traveled to be considered swipe
		var restraint = 100; // maximum distance allowed at the same time in perpendicular direction
		var allowedTime = 300; // maximum time allowed to travel that distance
		var elapsedTime;
		var startTime;
		var handleswipe = callback || function(swipedir){};

		touchsurface.addEventListener('touchstart', function(e){
			var touchobj = e.changedTouches[0];
			swipedir = 'none';
			dist = 0;
			startX = touchobj.pageX;
			startY = touchobj.pageY;
			startTime = new Date().getTime(); // record time when finger first makes contact with surface
			// e.preventDefault()
		}, false);

		touchsurface.addEventListener('touchmove', function(e){
			e.preventDefault(); // prevent scrolling when inside DIV
		}, false);

		touchsurface.addEventListener('touchend', function(e){
			var touchobj = e.changedTouches[0];
			distX = touchobj.pageX - startX; // get horizontal dist traveled by finger while in contact with surface
			distY = touchobj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
			elapsedTime = new Date().getTime() - startTime; // get time elapsed
			if (elapsedTime <= allowedTime){ // first condition for awipe met
				if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
					swipedir = (distX < 0)? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
				}
				else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
					swipedir = (distY < 0)? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
				}
			}
			handleswipe(swipedir);
			// e.preventDefault()
		}, false);
	},

	destroy: function() {
		this.dom_container.innerHTML = '';
		this.dom_container = null;
		this.dom_index = {
			prev: null,
			now: null,
			next: null
		};
		this.currentSlide = 0;
		this.currentInfo = null;
		this.imageData = [];
		this.imageInfo = [];
		this.dom_slides = null;
		this.dom_net = null;
		this.dom_prev = null;
		this.dom_next = null;
		this.dom_spin = null;
	}

};

