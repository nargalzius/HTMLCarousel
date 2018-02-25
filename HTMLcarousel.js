/*!
 *  HTML IMAGE CAROUSEL
 *
 *  1.9
 *
 *  author: Carlo J. Santos
 *  email: carlosantos@gmail.com
 *  documentation: https://github.com/nargalzius/HTMLvideo
 *
 *  Copyright (c) 2017, All Rights Reserved, www.nargalzius.com
 */

function Carousel(){}

Carousel.prototype = {
	debug: true,						// VERBOSE MODE
	mode: 1,							// 0: FADE | 1: SLIDE | 2: LEAF | 3: SCREENFLOW
	loop: true,							// INFINITE/CIRCULAR SLIDE NAVIGATION
	slide: 'cover',						// IMAGE FIT TO FRAME (CSS background-size)
	clickable: true,					// FIRE callback_slideClick ON MAIN IMAGE CLICK
	arrows: {
		size: 64,						// SIZE OF ARROWS
		margin: 0						// MARGIN OF ARROWS FROM EDGES
	},
	screenflow: {
		autostyle: true, 				// AUTO STYLING. IF SET TO FALSE, NONE OF THE VALUES IN THIS OBJECT WILL BE APPLIED
		width: null,					// MAIN IMAGE WIDTH
		height: null,					// MAIN IMAGE HEIGHT
		overlap: null,					// DISTANCE BETWEEN CENTER AND SECONDARY IMAGES
		scale: null,					// SCALE STEP FOR SECONDARY & TERTIARY IMAGES
		fade: null						// OPACITY FOR SECONDARY IMAGES
	},

	// COLORS
	colors_bg: '#000',					// CONTAINER BACKGROUND COLOR
	colors_prev: '#FFF',				// PREV ARROW COLOR
	colors_next: '#FFF',				// NEXT ARROW COLOR
	colors_spin: '#FFF',				// SPINNER COLOR
	colors_spin_bg: 'rgba(0,0,0,0.4)',	// SPINNER BG FRAME

	active_delay: 500,
	dom_debug: null,					// ASSIGN THIS TO A DIV IF YOU WANT CONSOLE LOGS IN HTML (USEFUL FOR MOBILE)

	// READ ONLY
	currentSlide: 0,
	currentInfo: null,

	dom_container: null,
	dom_slides: null,
	dom_net: null,
	dom_prev: null,
	dom_next: null,
	dom_spin: null,
	imageData: [],
	imageInfo: [],
	dom_index: {
		prev: null,
		now: null,
		next: null
	},
	movement: null,
	svg: {
		prev: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="48" height="48" viewBox="0 0 48 48"><path d="M30.844 14.813l-9.188 9.188 9.188 9.188-2.813 2.813-12-12 12-12z"></path></svg>',
		next: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="48" height="48" viewBox="0 0 48 48"><path d="M19.969 12l12 12-12 12-2.813-2.813 9.188-9.188-9.188-9.188z"></path></svg>',
		spin: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="0 0 32 32"><path d="M16 0c-8.711 0-15.796 6.961-15.995 15.624 0.185-7.558 5.932-13.624 12.995-13.624 7.18 0 13 6.268 13 14 0 1.657 1.343 3 3 3s3-1.343 3-3c0-8.837-7.163-16-16-16zM16 32c8.711 0 15.796-6.961 15.995-15.624-0.185 7.558-5.932 13.624-12.995 13.624-7.18 0-13-6.268-13-14 0-1.657-1.343-3-3-3s-3 1.343-3 3c0 8.837 7.163 16 16 16z"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" begin="0" dur="1s" repeatCount="indefinite" /></path></svg>'
	},
	ismobile: null,
	active: true,

	checkForMobile() {
		const SELF = this;
		const DESKTOP_AGENTS = [
	        'desktop'
	    ];

	    let mobileFlag = true;

	    if(typeof device !== 'undefined') {
	        // USE DEVICEJS IF AVAILABLE
	        for (let i = 0; i < DESKTOP_AGENTS.length; i++) {
	            let regex;
	                regex = new RegExp(DESKTOP_AGENTS[i], 'i');

	            if( window.document.documentElement.className.match(regex) ) {
	                mobileFlag = false;
	            }
	        }
	    } else {
	        // BACKUP [RUDIMENTARY] DETECTION
	        mobileFlag = 'ontouchstart' in window;
	    }

	    if( mobileFlag ) {
	        SELF.ismobile = true;
	        SELF.trace("mobile browser detected");
	    } else {
	        SELF.ismobile = false;
	        SELF.trace("desktop browser detected");
	    }
	},

	dom_template_prev() {
		const SELF = this;
		SELF.dom_prev = document.createElement('div');
		SELF.dom_prev.innerHTML = SELF.svg.prev;
		SELF.dom_prev.getElementsByTagName('path')[0].style.fill = SELF.colors_prev;
		SELF.dom_prev.getElementsByTagName('svg')[0].style.height = SELF.arrows.size;
		SELF.dom_prev.getElementsByTagName('svg')[0].style.width = SELF.arrows.size;
		SELF.setVendor(SELF.dom_prev, 'Filter', 'drop-shadow( 1px 1px 1px rgba(0,0,0,0.5) )');
		
	},

	dom_template_next() {
		const SELF = this;
		SELF.dom_next = document.createElement('div');
		SELF.dom_next.innerHTML = SELF.svg.next;
		SELF.dom_next.getElementsByTagName('path')[0].style.fill = SELF.colors_next;
		SELF.dom_next.getElementsByTagName('svg')[0].style.height = SELF.arrows.size;
		SELF.dom_next.getElementsByTagName('svg')[0].style.width = SELF.arrows.size;
		SELF.setVendor(SELF.dom_next, 'Filter', 'drop-shadow( -1px 1px 1px rgba(0,0,0,0.5) )');
	},

	dom_template_spin() {
		const SELF = this;
		SELF.dom_spin = document.createElement('div');
		SELF.dom_spin.style.backgroundColor = SELF.colors_spin_bg;
		SELF.setVendor(SELF.dom_spin, 'borderRadius', '32px');
		SELF.dom_spin.innerHTML = SELF.svg.spin;
		SELF.dom_spin.style.padding = '5px';
		SELF.dom_spin.style.width = '32px';
		SELF.dom_spin.style.height = '32px';
		SELF.dom_spin.getElementsByTagName('path')[0].style.fill = SELF.colors_spin;
	},

	// init(obj, imgarray, infoarray) {
	init(obj, data) {
		const SELF = this;

		// HANDLE INPUT DATA

		let imgarray = [];
		let infoarray = [];

		if( typeof data[0] == 'string' ) {
			for(let p in data) {
				SELF.imageData.push(data[p]);
			}
		}
		else {
			for(let p in data) {
				SELF.imageData.push(data[p].src);
				SELF.imageInfo.push(data[p].info);
			}
		} 

		if(SELF.imageData.length < 2) {
			alert('ABORTING INITIALIZATION:\nYou\'ll need at least two images else this slideshow is pointless');
			return;
		}

		if(SELF.mode === 3 && SELF.imageData.length < 3) {
			alert('You need at least three imageData for mode 3. Switching to default (1)');
			SELF.mode = 1;
		}

		if(SELF.ismobile === null) { SELF.checkForMobile(); }

		if(typeof obj === 'object') {
			SELF.dom_container = document.getElementById( obj.id );
		} else {
			SELF.dom_container = document.getElementById( obj );
		}

		if(SELF.ismobile) {
			SELF.swipedetect(SELF.dom_container, function(e){
				switch(e) {
					case 'left':
						SELF.nextSlide();
					break;
					case 'right':
						SELF.prevSlide();
					break;
					case 'up':
						if(SELF.mode === 0) {
							SELF.nextSlide();
						}
					break;
					case 'down':
						if(SELF.mode === 0) {
							SELF.prevSlide();
						}
					break;
				}
			});
		}

		let container_position = window.getComputedStyle(SELF.dom_container).getPropertyValue('position');

		// console.log(container_position);

		if(container_position === 'static') {
			SELF.dom_container.style.position = 'relative';
		}

		SELF.dom_container.style.backgroundColor = SELF.colors_bg;
		SELF.dom_container.style.overflow = 'hidden';

		if( document.defaultView && document.defaultView.getComputedStyle ) {
			let s = document.defaultView.getComputedStyle( SELF.dom_container, '' );
			SELF.zindex = parseInt( s.getPropertyValue('z-index'), 50 );
		} else if( SELF.dom_container.currentStyle ) {
			SELF.zindex = parseInt( SELF.dom_container.currentStyle.zIndex, 50 );
		}

		if(!SELF.zindex) {
			SELF.zindex = 0;
			SELF.trace('z-index for video container element not detected, make sure position property is set.\nzIndex set to 0');
		}

		// GENERATE DOM ELEMENTS

		SELF.dom_slides = document.createElement('div');
		SELF.dom_slides.className = 'slides';
		SELF.dom_slides.style.position = 'relative';
		SELF.dom_slides.style.height = '100%';
		SELF.dom_slides.style.width = '100%';
		SELF.dom_slides.style.top = 0;
		SELF.dom_slides.style.left = 0;
		SELF.dom_slides.style.display = 'block';
		SELF.dom_slides.style.zIndex = SELF.zindex + 1;
		SELF.dom_container.appendChild(SELF.dom_slides);

		SELF.dom_template_prev();
		SELF.addClass(SELF.dom_prev, 'cbtn');
		SELF.addClass(SELF.dom_prev, 'prev');
		SELF.dom_prev.style.zIndex = SELF.zindex + 6;
		SELF.dom_prev.style.display = 'block';
		SELF.dom_prev.style.position = 'absolute';
		SELF.dom_prev.style.cursor = 'pointer';
		SELF.dom_prev.style.opacity = 0;
		SELF.dom_prev.onclick = function() {

			SELF.addClass(this, 'clicked');

			setTimeout(function(){
				SELF.removeClass(SELF.dom_prev, 'clicked');
			}, 300);

			SELF.prevSlide();
		};
		SELF.dom_container.appendChild(SELF.dom_prev);

		SELF.dom_template_next();
		SELF.addClass(SELF.dom_next, 'cbtn');
		SELF.addClass(SELF.dom_next, 'next');
		SELF.dom_next.style.zIndex = SELF.zindex + 6;
		SELF.dom_next.style.display = 'block';
		SELF.dom_next.style.position = 'absolute';
		SELF.dom_next.style.cursor = 'pointer';
		SELF.dom_next.style.opacity = 0;
		SELF.dom_next.onclick = function() {

			SELF.addClass(this, 'clicked');
			
			setTimeout(function(){
				SELF.removeClass(SELF.dom_next, 'clicked');
			}, 300);

			SELF.nextSlide();
		};
		SELF.dom_container.appendChild(SELF.dom_next);

		SELF.dom_template_spin();
		SELF.addClass(SELF.dom_spin, 'spin');
		SELF.dom_spin.style.zIndex = SELF.zindex + 8;
		SELF.dom_spin.style.display = 'block';
		SELF.dom_spin.style.opacity = 0;
		SELF.dom_spin.style.visibility = 'visible';
		SELF.dom_spin.style.position = 'absolute';
		SELF.dom_container.appendChild(SELF.dom_spin);
		SELF.reflow();


		setTimeout(function(){
			SELF.setVendor(SELF.dom_prev, 'Transition', 'all 0.3s ease-In');
			SELF.setVendor(SELF.dom_next, 'Transition', 'all 0.3s ease-In');
			SELF.setVendor(SELF.dom_spin, 'Transition', 'all 0.3s ease-In');

			SELF.active = false;
			SELF.wait(1);
			SELF.loadSlide(0);
		}, 600);
	},

	prevSlide() {
		const SELF = this;

		// SELF.movement = 'left';

		if(SELF.active) {
			SELF.loadSlide(0, 0);
			SELF.currentSlide--;

			if(SELF.currentSlide < 0) {
				SELF.currentSlide = SELF.imageData.length-1;
			}

			SELF.trace(SELF.currentSlide);

			SELF.callback_slidePrev();
		}
	},

	nextSlide() {
		const SELF = this;

		// SELF.movement = 'right';

		if(SELF.active) {
			SELF.loadSlide(0, 1);
			SELF.currentSlide++;

			if( SELF.currentSlide > SELF.imageData.length - 1) {
				SELF.currentSlide = 0;
			}

			SELF.trace(SELF.currentSlide);

			SELF.callback_slideNext();
		}
	},

	checkEdges() {
		const SELF = this;

		SELF.trace('loop: '+SELF.loop);

		if(SELF.loop) {
			SELF.toggle(SELF.dom_prev, 1);
			SELF.toggle(SELF.dom_next, 1);
		} else {
			if(SELF.currentSlide === 0 ) {
				SELF.toggle(SELF.dom_prev, 0);
			} else {
				SELF.toggle(SELF.dom_prev, 1);
			}

			if( SELF.currentSlide === ( SELF.imageData.length - 1 ) ) {
				SELF.toggle(SELF.dom_next, 0);
			} else {
				SELF.toggle(SELF.dom_next, 1);
			}
		}

	},

	loadSlide(number, bool) {
		const SELF = this;
		
		let num = number+1;
		let parent = SELF.dom_slides;
		let dir = (bool) ? 'right' : 'left';

		// SELF.wait(1);

		let limage = [];
		let preload = [];

		// EVALUATE REGULAR SLIDESHOW OR SCREENFLOW

		if(!SELF.dom_index.next) {
			SELF.trace('first time');

			// SET IMAGE ARRAY TO HAVE PREVOIUS AS 0, CURRENT AS 1, AND NEXT AS 2
			SELF.arrayRotate(SELF.imageData, true);

			if(SELF.imageInfo.length) {
				SELF.arrayRotate(SELF.imageInfo, true);
			}

			if(SELF.mode === 3) {

				limage.push(SELF.imageData[0]);
				limage.push(SELF.imageData[1]);
				limage.push(SELF.imageData[2]);
				
			} else {
				limage.push(SELF.imageData[1]);
			}

		} else {
			SELF.trace('no longer first');

			if(dir === 'left') {
				SELF.arrayRotate(SELF.imageData, true);
				
				if(SELF.imageInfo.length) {
					SELF.arrayRotate(SELF.imageInfo, true);
				}
			} else {
				SELF.arrayRotate(SELF.imageData);

				if(SELF.imageInfo.length) {
					SELF.arrayRotate(SELF.imageInfo);
				}
			}

			if(SELF.mode === 3) {
				num = (dir === 'left') ? 0 : 2;
			} else {
				num = 1;
			}

			limage.push(SELF.imageData[num]);
		}

		if(SELF.imageInfo.length) {
			SELF.currentInfo = SELF.imageInfo[1];

			if(SELF.imageInfo[1].preload)
				preload = limage.concat(SELF.imageInfo[1].preload)
			else
				preload = limage;
		}
		else
			preload = limage;

		SELF.trace(preload);

		SELF.load(preload, function(){

			SELF.wait(0);
			SELF.callback_slideShow();

			let slide_next = (SELF.dom_index.next) ? SELF.dom_index.next : null;
			let slide_prev = (SELF.dom_index.prev) ? SELF.dom_index.prev : null;
			let slide_now = (SELF.dom_index.now) ? SELF.dom_index.now : null;
			let to;
			let from;

			// SCREENFLOW STUFF
			let mW;
			let mH;
			let x_center;
			let p_small;
			let p_xsmall;
			let x_left;
			let x_right;
			let xx_left;
			let xx_right;
			let bufferOffset
			let bufferVal

			if( SELF.mode === 3 && ( slide_next || slide_now || slide_prev ) ) {
				num = (dir === 'left') ? 0 : 2;
			}

			let slide = document.createElement('div');

				slide.className = 'slide hide';
				slide.style.position = 'absolute';
				slide.style.zIndex = SELF.zindex + 5;
				slide.style.backgroundImage = 'url('+SELF.imageData[num]+')';
				slide.style.backgroundRepeat = 'no-repeat';
				slide.style.backgroundPosition = 'center';

				if(SELF.mode === 3)
					SELF.addClass(slide, 'screenflow');
				
				if(SELF.screenflow.autostyle) {
					slide.style.backgroundSize = SELF.slide;
					slide.style.opacity = 0;
				}

			SELF.setVendor(slide, 'Transition', 'all 0.3s ease-In');
			parent.appendChild(slide);

			if(SELF.mode !== 3) {
				slide.style.width = '100%';
				slide.style.height = '100%';

				if(!slide_next) {
					setTimeout(function(){
						slide.style.left = 0;
						slide.style.opacity = 1;
						SELF.dom_index.next = slide;

						SELF.assignClicks();

						SELF.active = true;
					}, 50); // INITIAL
				}
			} else {
				if(!slide_next) {
					SELF.addClass(slide, 'center');
				} else {
					SELF.addClass(slide, 'hide');
					SELF.addClass(slide, 'tertiary');
				}
			}

			switch(SELF.mode) {
				case 1:
					// SLIDE

					to = (dir === 'left') ? SELF.dom_container.offsetWidth : SELF.dom_container.offsetWidth * -1;
					from = (dir === 'left') ? SELF.dom_container.offsetWidth * -1 : SELF.dom_container.offsetWidth;

					if(slide_next) {
						slide.style.opacity = 1;
						slide.style.left = from + 'px';
						setTimeout(function(){
							slide.style.left = '0px';
							slide_next.style.left = to + 'px';

							setTimeout(function(){
								slide_next.parentNode.removeChild(slide_next);
								SELF.dom_index.next = slide;

								SELF.assignClicks();

								SELF.active = true;
							}, SELF.active_delay);
						}, 200);
					}
				break;
				case 2:
					// LEAF

					to = (dir === 'left') ? SELF.dom_container.offsetWidth : SELF.dom_container.offsetWidth * -1;
					from = (dir === 'left') ? SELF.dom_container.offsetWidth * -1 : SELF.dom_container.offsetWidth;

					if(slide_next) {
						slide_next.style.zIndex = SELF.zindex + 20;
						slide.style.zIndex = SELF.zindex + 10;
						slide.style.opacity = 1;
						slide.style.left = '0px';

						setTimeout(function(){
							slide_next.style.left = to + 'px';

							setTimeout(function(){
								slide_next.parentNode.removeChild(slide_next);
								SELF.dom_index.next = slide;

								SELF.assignClicks();

								SELF.active = true;
							}, SELF.active_delay);
						}, 500);
					}
				break;
				case 3:

					// SCREENFLOW

					mW = ( SELF.screenflow.width ) ? SELF.screenflow.width : SELF.dom_container.offsetHeight;
					mH = ( SELF.screenflow.height ) ? SELF.screenflow.height : SELF.dom_container.offsetHeight;
					x_center = ( SELF.dom_container.offsetWidth - mW ) / 2;
					p_small = SELF.screenflow.scale ? SELF.screenflow.scale : 0.7;
					p_xsmall = Math.pow(p_small, 2);
					bufferVal = SELF.screenflow.overlap ? SELF.screenflow.overlap : 0;

					if(SELF.screenflow.autostyle) {
						slide.style.width = mW + 'px';
						slide.style.height = mH + 'px';
					}


					if(slide_prev || slide_now || slide_next) {

						x_left = slide_prev.offsetLeft;
						x_right = slide_next.offsetLeft;
						xx_left = slide_prev.offsetLeft - mW*p_small;
						xx_right = slide_next.offsetLeft + mW*p_small;

						parent.appendChild(slide);

						if(SELF.screenflow.autostyle) {
							slide.style.width = mW + 'px';
							slide.style.height = mH + 'px';
							slide.style.opacity = 0;
							SELF.setVendor(slide, 'Transform', 'scale('+p_xsmall+')');
							slide.style.left = ( (dir === 'left') ? xx_left : xx_right ) + 'px';
						}
						
						
						SELF.addClass(slide, 'tertiary');
						SELF.addClass(slide, (dir === 'left') ? 'left' : 'right' );


						// SHIFT EVERYTHING

						setTimeout(function(){

							SELF.addClass(slide_now, 'secondary');
							SELF.addClass(slide_now, (dir === 'left') ? 'right' : 'left' );
							SELF.removeClass(slide_now, 'center');

							SELF.removeClass( (dir === 'left') ? slide_prev : slide_next, 'secondary' );
							SELF.removeClass( (dir === 'left') ? slide_next : slide_prev, 'secondary' );
							SELF.addClass( (dir === 'left') ? slide_next : slide_prev, 'tertiary' );
							SELF.removeClass( 
								(dir === 'left') ? slide_prev : slide_next, 
								(dir === 'left') ? 'left' : 'right' 
							);
							
							SELF.addClass( (dir === 'left') ? slide_prev : slide_next, 'center' );
							
							SELF.removeClass(slide, 'tertiary');
							SELF.removeClass(slide, 'hide');
							SELF.addClass(slide, 'secondary');

							if(dir === 'left') {

								slide_next.style.zIndex = SELF.zindex + 3;
								slide.style.zIndex = SELF.zindex + 3;

								if(SELF.screenflow.autostyle) {
									slide_next.style.left = xx_right + 'px';
									slide_next.style.opacity = 0;
									SELF.setVendor(slide_next, 'Transform', 'scale('+p_xsmall+')');

									slide_now.style.left = x_right + 'px';
									slide_now.style.opacity = SELF.screenflow.fade ? SELF.screenflow.fade : 0.7;
									SELF.setVendor(slide_now, 'Transform', 'scale('+p_small+')');

									slide_prev.style.left = x_center + 'px';
									slide_prev.style.opacity = 1;
									SELF.setVendor(slide_prev, 'Transform', 'scale(1.0)');

									slide.style.left = x_left + 'px';
									slide.style.opacity = SELF.screenflow.fade ? SELF.screenflow.fade : 0.7;
									SELF.setVendor(slide, 'Transform', 'scale('+p_small+')');
								}

								setTimeout(function(){
									slide_prev.style.zIndex = SELF.zindex + 6;
								}, 50);

								setTimeout(function(){
									slide_next.parentNode.removeChild(slide_next);

									slide_now.style.zIndex = SELF.zindex + 4;
									slide_prev.style.zIndex = SELF.zindex + 5;

									SELF.dom_index.prev = slide;
									SELF.dom_index.now = slide_prev;
									SELF.dom_index.next = slide_now;

									SELF.assignClicks();

									SELF.active = true;
								}, SELF.active_delay);

							} else {

								slide_prev.style.zIndex = SELF.zindex + 3;
								slide.style.zIndex = SELF.zindex + 3;

								if(SELF.screenflow.autostyle) {
									slide_prev.style.left = xx_left + 'px';
									slide_prev.style.opacity = 0;
									SELF.setVendor(slide_prev, 'Transform', 'scale('+p_xsmall+')');

									slide_now.style.left = x_left + 'px';
									slide_now.style.opacity = SELF.screenflow.fade ? SELF.screenflow.fade : 0.7;
									SELF.setVendor(slide_now, 'Transform', 'scale('+p_small+')');

									slide_next.style.left = x_center + 'px';
									slide_next.style.opacity = 1;
									SELF.setVendor(slide_next, 'Transform', 'scale(1.0)');

									slide.style.left = x_right + 'px';
									slide.style.opacity = SELF.screenflow.fade ? SELF.screenflow.fade : 0.7;
									SELF.setVendor(slide, 'Transform', 'scale('+p_small+')');
								}

								setTimeout(function(){
									slide_next.style.zIndex = SELF.zindex + 6;
								}, 50);

								setTimeout(function(){
									slide_prev.parentNode.removeChild(slide_prev);

									slide_now.style.zIndex = SELF.zindex + 4;
									slide_next.style.zIndex = SELF.zindex + 5;

									SELF.dom_index.prev = slide_now;
									SELF.dom_index.now = slide_next;
									SELF.dom_index.next = slide;

									SELF.assignClicks();

									SELF.active = true;

								}, SELF.active_delay);

							}
						}, 50);

					} else {

						let left = document.createElement('div');
							left.style.position = 'absolute';
							left.style.backgroundImage = 'url('+SELF.imageData[num-1]+')';
							left.style.backgroundRepeat = 'no-repeat';
							left.style.backgroundPosition = 'center';
							left.style.zIndex = SELF.zindex + 4;
							if(SELF.screenflow.autostyle) {
								left.style.opacity = 0;
								left.style.width = mW + 'px';
								left.style.height = mH + 'px';
								left.style.backgroundSize = SELF.slide;
								SELF.setVendor(left, 'Transform', 'scale('+p_small+')');
							}
							left.className = 'slide secondary hide left screenflow';
							SELF.setVendor(left, 'Transition', 'all 0.3s ease-In');
							parent.appendChild(left);

						let right = document.createElement('div');
							right.style.position = 'absolute';
							right.style.backgroundImage = 'url('+SELF.imageData[num+1]+')';
							right.style.backgroundRepeat = 'no-repeat';
							right.style.backgroundPosition = 'center';
							right.style.zIndex = SELF.zindex + 4;
							if(SELF.screenflow.autostyle) {
								right.style.opacity = 0;
								right.style.width = mW + 'px';
								right.style.height = mH + 'px';
								right.style.backgroundSize = SELF.slide;
								SELF.setVendor(right, 'Transform', 'scale('+p_small+')');
							}
							right.className = 'slide secondary hide right screenflow';
							SELF.setVendor(right, 'Transition', 'all 0.3s ease-In');
							
							parent.appendChild(right);

						bufferOffset = ( ( left.offsetWidth - ( left.offsetWidth * p_small ) ) / 2 );
						
						x_left = x_center - ( left.offsetWidth + bufferVal - bufferOffset);
						x_right = x_center + mW + bufferVal - bufferOffset;

						if(SELF.screenflow.autostyle) {
							left.style.left = x_left + 'px';
							right.style.left = x_right + 'px';
							slide.style.left = x_center + 'px';
						}

						SELF.addClass(slide, 'center');

						setTimeout(function(){

							SELF.removeClass(slide, 'hide');
							SELF.removeClass(left, 'hide');
							SELF.removeClass(right, 'hide');
							
							if(SELF.screenflow.autostyle) {
								slide.style.opacity = 1;
								left.style.opacity = SELF.screenflow.fade ? SELF.screenflow.fade : 0.7;
								right.style.opacity = SELF.screenflow.fade ? SELF.screenflow.fade : 0.7;
							}
							SELF.dom_index.now = slide;
							SELF.dom_index.prev = left;
							SELF.dom_index.next = right;

							SELF.assignClicks();

							SELF.active = true;

						}, SELF.active_delay);
					}

				break;
				default:
					// FADE
					if(slide_next) {

						slide_next.style.zIndex = SELF.zindex + 4;

						setTimeout(function(){
							slide.style.opacity = 1;
						}, 50);
						setTimeout(function(){
							slide_next.parentNode.removeChild(slide_next);
							SELF.dom_index.next = slide;

							SELF.assignClicks();

							SELF.active = true;
						}, SELF.active_delay);
					}
			}
			SELF.checkEdges();
		});


	},

	assignClicks() {
		const SELF = this;

		if(SELF.mode === 3) {
			SELF.dom_index.prev.style.cursor = 'default';
			SELF.dom_index.prev.onclick = function() {
				if(SELF.loop || SELF.currentSlide !== 0 && SELF.active) {
					SELF.prevSlide();
				}

			};

			SELF.dom_index.next.style.cursor = 'default';
			SELF.dom_index.next.onclick = function() {
				if(SELF.loop || SELF.currentSlide !== SELF.imageData.length-1 && SELF.active) {
					SELF.nextSlide();
				}
			};

			if(SELF.clickable) {
				SELF.dom_index.now.style.cursor = 'pointer';
			}
			SELF.dom_index.now.onclick = function() {
				if(SELF.clickable && SELF.active) {
					SELF.callback_slideClick();
				}
			};
		} else {
			if(SELF.clickable) {
				SELF.dom_index.next.style.cursor = 'pointer';
			}
			SELF.dom_index.next.onclick = function() {
				if(SELF.clickable && SELF.active) {
					SELF.callback_slideClick();
				}
			};
		}
	},

	callback_slidePrev() {
		const SELF = this;
			  SELF.trace('------------------ callback_slidePrev');
	},

	callback_slideNext() {
		const SELF = this;
			  SELF.trace('------------------ callback_slideNext');
	},

	callback_slideShow() {
		const SELF = this;
			  SELF.trace('------------------ callback_slideShow');
	},

	callback_slideClick() {
		const SELF = this;
			  SELF.trace('------------------ callback_slideClick');
	},

	toggle(obj, bool) {
		const SELF = this;

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

	wait(bool) {
		const SELF = this;
			  SELF.active = false;

		if(bool) {
			SELF.toggle(SELF.dom_spin, 1);
			// SELF.toggle(SELF.dom_net, 1);
		} else {
			SELF.toggle(SELF.dom_spin, 0);
			// SELF.toggle(SELF.dom_net, 0);
		}

	},

	get(str) {
		const SELF = this;

		return document.querySelector(str);
	},

	reflow() {
		const SELF = this;

		SELF.dom_spin.style.top = '50%';
		SELF.dom_spin.style.marginTop = ( Number( SELF.dom_spin.offsetHeight / 2 ) * -1 ) + 'px';
		SELF.dom_spin.style.left = '50%';
		SELF.dom_spin.style.marginLeft = ( Number( SELF.dom_spin.offsetWidth / 2 ) * -1 ) + 'px';

		SELF.dom_prev.style.top = '50%';
		SELF.dom_prev.style.marginTop = ( Number( SELF.dom_prev.offsetHeight / 2 ) * -1 ) + 'px';
		SELF.dom_prev.style.left = SELF.arrows.margin+'px';

		SELF.dom_next.style.top = '50%';
		SELF.dom_next.style.marginTop = ( Number( SELF.dom_next.offsetHeight / 2 ) * -1 ) + 'px';
		SELF.dom_next.style.right = SELF.arrows.margin+'px';
	},

	setVendor(element, property, value) {
		const SELF = this;
		
		let styles = window.getComputedStyle(element, '');
		let regexp = new RegExp(property+'$', 'i');

		for (let key in styles) {
			if( regexp.test(key) ) {
				element.style[key] = value;
			}
		}
	
	},
	loadedFiles: [],
	isLoaded (file, array) {
		const SELF = this;

        for(let i = 0; i < array.length; i++)
        {
            if(array[i] === file)
            {
                return true;
            }
        }
        return false;
    },
	load(arg, callback) {
		const SELF = this;

		switch(typeof arg)
		{
			case 'object':
				let lcounter  = 0;

				let onload = function() {
					if(++lcounter === arg.length && callback) {
						callback();
					}
				};

				let onerror = function(e) { if(window.console) { console.log(e); } };

				for(let i = 0; i < arg.length; i++)
				{
					if( !SELF.isLoaded(arg[i], SELF.loadedFiles) ) {
						SELF.wait(1);
						let imgs = new Image();
							imgs.onload = onload;
							imgs.onerror = onerror;
							imgs.src = arg[i];
						SELF.loadedFiles.push(arg[i]);
					} else {
						SELF.trace('already loaded '+ arg[i]);
						onload();
					}
				}
			break;
			default:
				if( !SELF.isLoaded(arg, SELF.loadedFiles) ) {
					SELF.wait(1);
					let img = new Image();
						img.onload = function(){
							callback();
						};
						img.onerror = function(e) { if(window.console) { console.log(e); } };
						img.src = arg;
					SELF.loadedFiles.push(arg);
				} else {
					SELF.trace('already loaded '+ arg);
					callback();
				}
		}
	},

	arrayRotate(arr, reverse){
		const SELF = this;

		if(reverse) {
			arr.unshift(arr.pop());
			SELF.trace('array shifted left');

			SELF.movement = 'right';
		}
		else {
			arr.push(arr.shift());
			SELF.trace('array shifted right');

			SELF.movement = 'left';
		}
		return arr;
	},

	trace(str) {
		const SELF = this;

		if(SELF.debug) {

			if(window.console) {
				window.console.log(str);
			}

			if( SELF.dom_debug ) {
				SELF.dom_debug.innerHTML += str + '<br>';
			}
		}
	},

	addClass(el, className) {
		const SELF = this;

		if (el.classList) {
			el.classList.add(className);
		} else {
			el.className += ' ' + className;
		}
	},

	removeClass(el, className) {
		const SELF = this;

		if (el.classList) {
			el.classList.remove(className);
		} else {
			el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	},

	swipedetect(el, callback){
		const SELF = this;

		let touchsurface = el;
		let swipedir;
		let startX;
		let startY;
		let distX;
		let distY;
		let dist;
		let threshold = 150; //required min distance traveled to be considered swipe
		let restraint = 100; // maximum distance allowed at the same time in perpendicular direction
		let allowedTime = 300; // maximum time allowed to travel that distance
		let elapsedTime;
		let startTime;
		let handleswipe = callback || function(swipedir){};

		touchsurface.addEventListener('touchstart', function(e){
			let touchobj = e.changedTouches[0];
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
			let touchobj = e.changedTouches[0];
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
		}, false);
	},

	destroy() {
		const SELF = this;

		SELF.dom_container.innerHTML = '';
		SELF.dom_container = null;
		SELF.dom_index = {
			prev: null,
			now: null,
			next: null
		};
		SELF.currentSlide = 0;
		SELF.currentInfo = null;
		SELF.imageData = [];
		SELF.imageInfo = [];
		SELF.dom_slides = null;
		SELF.dom_net = null;
		SELF.dom_prev = null;
		SELF.dom_next = null;
		SELF.dom_spin = null;
	}

};