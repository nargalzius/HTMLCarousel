/*!
 *  HTML IMAGE CAROUSEL
 *
 *  2.1
 *
 *  author: Carlo J. Santos
 *  email: carlosantos@gmail.com
 *  documentation: https://github.com/nargalzius/HTMLvideo
 *
 *  Copyright (c) 2017, All Rights Reserved, www.nargalzius.com
 */

function Carousel(){}

Carousel.prototype = {
    debug: true,                        // VERBOSE MODE
    mode: 1,                            // 0: FADE | 1: SLIDE | 2: LEAF | 3: SCREENFLOW
    loop: true,                         // INFINITE/CIRCULAR SLIDE NAVIGATION
    slide: 'cover',                     // IMAGE FIT TO FRAME (CSS background-size)
    clickable: true,                    // FIRE callback_slideClick ON MAIN IMAGE CLICK
    arrows: {
        size: 64,                       // SIZE OF ARROWS
        margin: 0                       // MARGIN OF ARROWS FROM EDGES
    },
    screenflow: {
        autostyle: true,                // AUTO STYLING. IF SET TO FALSE, NONE OF THE VALUES IN THIS OBJECT WILL BE APPLIED
        width: null,                    // MAIN IMAGE WIDTH
        height: null,                   // MAIN IMAGE HEIGHT
        overlap: null,                  // DISTANCE BETWEEN CENTER AND SECONDARY IMAGES
        scale: null,                    // SCALE STEP FOR SECONDARY & TERTIARY IMAGES
        fade: null                      // OPACITY FOR SECONDARY IMAGES
    },

    // COLORS
    colors_bg: '#000',                  // CONTAINER BACKGROUND COLOR
    colors_prev: '#FFF',                // PREV ARROW COLOR
    colors_next: '#FFF',                // NEXT ARROW COLOR
    colors_spin: '#FFF',                // SPINNER COLOR
    colors_spin_bg: 'rgba(0,0,0,0.4)',  // SPINNER BG FRAME

    active_delay: 500,
    dom_debug: null,                    // ASSIGN THIS TO A DIV IF YOU WANT CONSOLE LOGS IN HTML (USEFUL FOR MOBILE)

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
    ready: false,

    checkForMobile() {
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
            this.ismobile = true;
            this.trace("mobile browser detected");
        } else {
            this.ismobile = false;
            this.trace("desktop browser detected");
        }
    },

    dom_template_prev() {
        this.dom_prev = document.createElement('div');
        this.dom_prev.innerHTML = this.svg.prev;
        this.dom_prev.getElementsByTagName('path')[0].style.fill = this.colors_prev;
        this.dom_prev.getElementsByTagName('svg')[0].style.height = this.arrows.size;
        this.dom_prev.getElementsByTagName('svg')[0].style.width = this.arrows.size;
        this.setVendor(this.dom_prev, 'Filter', 'drop-shadow( 1px 1px 1px rgba(0,0,0,0.5) )');
        
    },

    dom_template_next() {
        this.dom_next = document.createElement('div');
        this.dom_next.innerHTML = this.svg.next;
        this.dom_next.getElementsByTagName('path')[0].style.fill = this.colors_next;
        this.dom_next.getElementsByTagName('svg')[0].style.height = this.arrows.size;
        this.dom_next.getElementsByTagName('svg')[0].style.width = this.arrows.size;
        this.setVendor(this.dom_next, 'Filter', 'drop-shadow( -1px 1px 1px rgba(0,0,0,0.5) )');
    },

    dom_template_spin() {
        this.dom_spin = document.createElement('div');
        this.dom_spin.style.backgroundColor = this.colors_spin_bg;
        this.setVendor(this.dom_spin, 'borderRadius', '32px');
        this.dom_spin.innerHTML = this.svg.spin;
        this.dom_spin.style.padding = '5px';
        this.dom_spin.style.width = '32px';
        this.dom_spin.style.height = '32px';
        this.dom_spin.getElementsByTagName('path')[0].style.fill = this.colors_spin;
    },

    init(obj, data) {

        if( typeof data[0] == 'string' ) {
            for(let p in data) {
                this.imageData.push(data[p]);
            }
        }
        else {
            for(let p in data) {
                this.imageData.push(data[p].src);
                this.imageInfo.push(data[p].info);
            }
        } 

        if(this.imageData.length < 2) {
            alert('ABORTING INITIALIZATION:\nYou\'ll need at least two images else this slideshow is pointless');
            return;
        }

        if(this.mode === 3 && this.imageData.length < 3) {
            alert('You need at least three imageData for mode 3. Switching to default (1)');
            this.mode = 1;
        }

        if(this.ismobile === null) { this.checkForMobile(); }

        if(typeof obj === 'object') {
            this.dom_container = document.getElementById( obj.id );
        } else {
            this.dom_container = document.getElementById( obj );
        }

        if( this.ismobile ) {
            this.swipedetect(this.dom_container, (e) => {
                switch(e) {
                    case 'left':
                        this.nextSlide();
                        this.callback_swipeLeft();
                    break;
                    case 'right':
                        this.prevSlide();
                        this.callback_swipeRight();
                    break;
                    case 'up':
                        if(this.mode === 0) {
                            this.nextSlide();
                        }
                        this.callback_swipeUp();
                    break;
                    case 'down':
                        if(this.mode === 0) {
                            this.prevSlide();
                        }
                        this.callback_swipeDown();
                    break;
                }
            });
        }

        let container_position = window.getComputedStyle(this.dom_container).getPropertyValue('position');

        // console.log(container_position);

        if(container_position === 'static') {
            this.dom_container.style.position = 'relative';
        }

        this.dom_container.style.backgroundColor = this.colors_bg;
        this.dom_container.style.overflow = 'hidden';

        if( document.defaultView && document.defaultView.getComputedStyle ) {
            let s = document.defaultView.getComputedStyle( this.dom_container, '' );
            this.zindex = parseInt( s.getPropertyValue('z-index'), 50 );
        } else if( this.dom_container.currentStyle ) {
            this.zindex = parseInt( this.dom_container.currentStyle.zIndex, 50 );
        }

        if(!this.zindex) {
            this.zindex = 0;
            this.trace('z-index for video container element not detected, make sure position property is set.\nzIndex set to 0');
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
        this.dom_prev.onclick = () => {

            this.addClass(this, 'clicked');

            setTimeout( () => {
                this.removeClass(this.dom_prev, 'clicked');
            }, 300);

            this.prevSlide();

            this.callback_clickPrev();
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
        this.dom_next.onclick = () => {

            this.addClass(this, 'clicked');
            
            setTimeout( () => {
                this.removeClass(this.dom_next, 'clicked');
            }, 300);

            this.nextSlide();

            this.callback_clickNext();
        };
        this.dom_container.appendChild(this.dom_next);

        this.dom_template_spin();
        this.addClass(this.dom_spin, 'spin');
        this.dom_spin.style.zIndex = this.zindex + 8;
        this.dom_spin.style.display = 'block';
        this.dom_spin.style.opacity = 0;
        this.dom_spin.style.visibility = 'visible';
        this.dom_spin.style.position = 'absolute';
        this.dom_container.appendChild(this.dom_spin);
        this.reflow();


        setTimeout( () => {
            this.setVendor(this.dom_prev, 'Transition', 'all 0.3s ease-In');
            this.setVendor(this.dom_next, 'Transition', 'all 0.3s ease-In');
            this.setVendor(this.dom_spin, 'Transition', 'all 0.3s ease-In');

            this.active = false;
            this.wait(1);
            this.loadSlide(0);
        }, 600);
    },

    prevSlide() {

        // this.movement = 'left';

        if(this.active) {
            this.loadSlide(0, 0);
            this.currentSlide--;

            if(this.currentSlide < 0) {
                this.currentSlide = this.imageData.length-1;
            }

            this.trace(this.currentSlide);

            this.callback_slidePrev();
        }
    },

    nextSlide() {

        // this.movement = 'right';

        if(this.active) {
            this.loadSlide(0, 1);
            this.currentSlide++;

            if( this.currentSlide > this.imageData.length - 1) {
                this.currentSlide = 0;
            }

            this.trace(this.currentSlide);

            this.callback_slideNext();
        }
    },

    checkEdges() {

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

    loadSlide(number, bool) {
        
        let num = number+1;
        let parent = this.dom_slides;
        let dir = (bool) ? 'right' : 'left';

        let limage = [];
        let preload = [];

        // EVALUATE REGULAR SLIDESHOW OR SCREENFLOW

        if(!this.dom_index.next) {
            this.trace('first time');

            // SET IMAGE ARRAY TO HAVE PREVOIUS AS 0, CURRENT AS 1, AND NEXT AS 2
            this.arrayRotate(this.imageData, true);

            if(this.imageInfo.length) {
                this.arrayRotate(this.imageInfo, true);
            }

            if(this.mode === 3) {

                limage.push(this.imageData[0]);
                limage.push(this.imageData[1]);
                limage.push(this.imageData[2]);
                
            } else {
                limage.push(this.imageData[1]);
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

            limage.push(this.imageData[num]);
        }

        if(this.imageInfo.length) {

            this.currentInfo = this.imageInfo[1];

            if(this.currentInfo.preload) {
                let pl = this.currentInfo.preload;

                if(pl === 'object' )
                    if( this.imageInfo[1].preload.constructor === Array ) {
                        for( let i = 0; i < pl.length; i++)
                            limage.push(pl[i]);
                } else {
                    limage.push(pl)
                }
            }
        }
        
        preload = limage;

        this.trace(preload);

        this.load(preload, () => {

            this.wait(0);
            if(!this.ready) {
                this.callback_slideReady();
                this.ready = true;
            }

            this.callback_slideShow();

            let slide_next = (this.dom_index.next) ? this.dom_index.next : null;
            let slide_prev = (this.dom_index.prev) ? this.dom_index.prev : null;
            let slide_now = (this.dom_index.now) ? this.dom_index.now : null;
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

            if( this.mode === 3 && ( slide_next || slide_now || slide_prev ) ) {
                num = (dir === 'left') ? 0 : 2;
            }

            let slide = document.createElement('div');

                slide.className = 'slide hide';
                slide.style.position = 'absolute';
                slide.style.zIndex = this.zindex + 5;
                slide.style.backgroundImage = 'url('+this.imageData[num]+')';
                slide.style.backgroundRepeat = 'no-repeat';
                slide.style.backgroundPosition = 'center';

                if(this.mode === 3)
                    this.addClass(slide, 'screenflow');
                
                if(this.screenflow.autostyle) {
                    slide.style.backgroundSize = this.slide;
                    slide.style.opacity = 0;
                }

            this.setVendor(slide, 'Transition', 'all 0.3s ease-In');
            parent.appendChild(slide);

            if(this.mode !== 3) {
                slide.style.width = '100%';
                slide.style.height = '100%';

                if(!slide_next) {
                    setTimeout( () => {
                        slide.style.left = 0;
                        slide.style.opacity = 1;
                        this.dom_index.next = slide;

                        this.assignClicks();

                        this.active = true;
                    }, 50); // INITIAL
                }
            } else {
                if(!slide_next) {
                    this.addClass(slide, 'center');
                } else {
                    this.addClass(slide, 'hide');
                    this.addClass(slide, 'tertiary');
                }
            }

            switch(this.mode) {
                case 1:
                    // SLIDE

                    to = (dir === 'left') ? this.dom_container.offsetWidth : this.dom_container.offsetWidth * -1;
                    from = (dir === 'left') ? this.dom_container.offsetWidth * -1 : this.dom_container.offsetWidth;

                    if(slide_next) {
                        slide.style.opacity = 1;
                        slide.style.left = from + 'px';
                        setTimeout( () => {
                            slide.style.left = '0px';
                            slide_next.style.left = to + 'px';

                            setTimeout( () => {
                                slide_next.parentNode.removeChild(slide_next);
                                this.dom_index.next = slide;

                                this.assignClicks();

                                this.active = true;
                            }, this.active_delay);
                        }, 200);
                    }
                break;
                case 2:
                    // LEAF

                    to = (dir === 'left') ? this.dom_container.offsetWidth : this.dom_container.offsetWidth * -1;
                    from = (dir === 'left') ? this.dom_container.offsetWidth * -1 : this.dom_container.offsetWidth;

                    if(slide_next) {
                        slide_next.style.zIndex = this.zindex + 20;
                        slide.style.zIndex = this.zindex + 10;
                        slide.style.opacity = 1;
                        slide.style.left = '0px';

                        setTimeout( () => {
                            slide_next.style.left = to + 'px';

                            setTimeout( () => {
                                slide_next.parentNode.removeChild(slide_next);
                                this.dom_index.next = slide;

                                this.assignClicks();

                                this.active = true;
                            }, this.active_delay);
                        }, 500);
                    }
                break;
                case 3:

                    // SCREENFLOW

                    mW = ( this.screenflow.width ) ? this.screenflow.width : this.dom_container.offsetHeight;
                    mH = ( this.screenflow.height ) ? this.screenflow.height : this.dom_container.offsetHeight;
                    x_center = ( this.dom_container.offsetWidth - mW ) / 2;
                    p_small = this.screenflow.scale ? this.screenflow.scale : 0.7;
                    p_xsmall = Math.pow(p_small, 2);
                    bufferVal = this.screenflow.overlap ? this.screenflow.overlap : 0;

                    if(this.screenflow.autostyle) {
                        slide.style.width = mW + 'px';
                        slide.style.height = mH + 'px';
                    }


                    if(slide_prev || slide_now || slide_next) {

                        x_left = slide_prev.offsetLeft;
                        x_right = slide_next.offsetLeft;
                        xx_left = slide_prev.offsetLeft - mW*p_small;
                        xx_right = slide_next.offsetLeft + mW*p_small;

                        parent.appendChild(slide);

                        if(this.screenflow.autostyle) {
                            slide.style.width = mW + 'px';
                            slide.style.height = mH + 'px';
                            slide.style.opacity = 0;
                            this.setVendor(slide, 'Transform', 'scale('+p_xsmall+')');
                            slide.style.left = ( (dir === 'left') ? xx_left : xx_right ) + 'px';
                        }
                        
                        
                        this.addClass(slide, 'tertiary');
                        this.addClass(slide, (dir === 'left') ? 'left' : 'right' );


                        // SHIFT EVERYTHING

                        setTimeout( () => {

                            this.addClass(slide_now, 'secondary');
                            this.addClass(slide_now, (dir === 'left') ? 'right' : 'left' );
                            this.removeClass(slide_now, 'center');

                            this.removeClass( (dir === 'left') ? slide_prev : slide_next, 'secondary' );
                            this.removeClass( (dir === 'left') ? slide_next : slide_prev, 'secondary' );
                            this.addClass( (dir === 'left') ? slide_next : slide_prev, 'tertiary' );
                            this.removeClass( 
                                (dir === 'left') ? slide_prev : slide_next, 
                                (dir === 'left') ? 'left' : 'right' 
                            );
                            
                            this.addClass( (dir === 'left') ? slide_prev : slide_next, 'center' );
                            
                            this.removeClass(slide, 'tertiary');
                            this.removeClass(slide, 'hide');
                            this.addClass(slide, 'secondary');

                            if(dir === 'left') {

                                slide_next.style.zIndex = this.zindex + 3;
                                slide.style.zIndex = this.zindex + 3;

                                if(this.screenflow.autostyle) {
                                    slide_next.style.left = xx_right + 'px';
                                    slide_next.style.opacity = 0;
                                    this.setVendor(slide_next, 'Transform', 'scale('+p_xsmall+')');

                                    slide_now.style.left = x_right + 'px';
                                    slide_now.style.opacity = this.screenflow.fade ? this.screenflow.fade : 0.7;
                                    this.setVendor(slide_now, 'Transform', 'scale('+p_small+')');

                                    slide_prev.style.left = x_center + 'px';
                                    slide_prev.style.opacity = 1;
                                    this.setVendor(slide_prev, 'Transform', 'scale(1.0)');

                                    slide.style.left = x_left + 'px';
                                    slide.style.opacity = this.screenflow.fade ? this.screenflow.fade : 0.7;
                                    this.setVendor(slide, 'Transform', 'scale('+p_small+')');
                                }

                                setTimeout( () => {
                                    slide_prev.style.zIndex = this.zindex + 6;
                                }, 50);

                                setTimeout( () => {
                                    slide_next.parentNode.removeChild(slide_next);

                                    slide_now.style.zIndex = this.zindex + 4;
                                    slide_prev.style.zIndex = this.zindex + 5;

                                    this.dom_index.prev = slide;
                                    this.dom_index.now = slide_prev;
                                    this.dom_index.next = slide_now;

                                    this.assignClicks();

                                    this.active = true;
                                }, this.active_delay);

                            } else {

                                slide_prev.style.zIndex = this.zindex + 3;
                                slide.style.zIndex = this.zindex + 3;

                                if(this.screenflow.autostyle) {
                                    slide_prev.style.left = xx_left + 'px';
                                    slide_prev.style.opacity = 0;
                                    this.setVendor(slide_prev, 'Transform', 'scale('+p_xsmall+')');

                                    slide_now.style.left = x_left + 'px';
                                    slide_now.style.opacity = this.screenflow.fade ? this.screenflow.fade : 0.7;
                                    this.setVendor(slide_now, 'Transform', 'scale('+p_small+')');

                                    slide_next.style.left = x_center + 'px';
                                    slide_next.style.opacity = 1;
                                    this.setVendor(slide_next, 'Transform', 'scale(1.0)');

                                    slide.style.left = x_right + 'px';
                                    slide.style.opacity = this.screenflow.fade ? this.screenflow.fade : 0.7;
                                    this.setVendor(slide, 'Transform', 'scale('+p_small+')');
                                }

                                setTimeout( () => {
                                    slide_next.style.zIndex = this.zindex + 6;
                                }, 50);

                                setTimeout( () => {
                                    slide_prev.parentNode.removeChild(slide_prev);

                                    slide_now.style.zIndex = this.zindex + 4;
                                    slide_next.style.zIndex = this.zindex + 5;

                                    this.dom_index.prev = slide_now;
                                    this.dom_index.now = slide_next;
                                    this.dom_index.next = slide;

                                    this.assignClicks();

                                    this.active = true;

                                }, this.active_delay);

                            }
                        }, 50);

                    } else {

                        let left = document.createElement('div');
                            left.style.position = 'absolute';
                            left.style.backgroundImage = 'url('+this.imageData[num-1]+')';
                            left.style.backgroundRepeat = 'no-repeat';
                            left.style.backgroundPosition = 'center';
                            left.style.zIndex = this.zindex + 4;
                            if(this.screenflow.autostyle) {
                                left.style.opacity = 0;
                                left.style.width = mW + 'px';
                                left.style.height = mH + 'px';
                                left.style.backgroundSize = this.slide;
                                this.setVendor(left, 'Transform', 'scale('+p_small+')');
                            }
                            left.className = 'slide secondary hide left screenflow';
                            this.setVendor(left, 'Transition', 'all 0.3s ease-In');
                            parent.appendChild(left);

                        let right = document.createElement('div');
                            right.style.position = 'absolute';
                            right.style.backgroundImage = 'url('+this.imageData[num+1]+')';
                            right.style.backgroundRepeat = 'no-repeat';
                            right.style.backgroundPosition = 'center';
                            right.style.zIndex = this.zindex + 4;
                            if(this.screenflow.autostyle) {
                                right.style.opacity = 0;
                                right.style.width = mW + 'px';
                                right.style.height = mH + 'px';
                                right.style.backgroundSize = this.slide;
                                this.setVendor(right, 'Transform', 'scale('+p_small+')');
                            }
                            right.className = 'slide secondary hide right screenflow';
                            this.setVendor(right, 'Transition', 'all 0.3s ease-In');
                            
                            parent.appendChild(right);

                        bufferOffset = ( ( left.offsetWidth - ( left.offsetWidth * p_small ) ) / 2 );
                        
                        x_left = x_center - ( left.offsetWidth + bufferVal - bufferOffset);
                        x_right = x_center + mW + bufferVal - bufferOffset;

                        if(this.screenflow.autostyle) {
                            left.style.left = x_left + 'px';
                            right.style.left = x_right + 'px';
                            slide.style.left = x_center + 'px';
                        }

                        this.addClass(slide, 'center');

                        setTimeout( () => {

                            this.removeClass(slide, 'hide');
                            this.removeClass(left, 'hide');
                            this.removeClass(right, 'hide');
                            
                            if(this.screenflow.autostyle) {
                                slide.style.opacity = 1;
                                left.style.opacity = this.screenflow.fade ? this.screenflow.fade : 0.7;
                                right.style.opacity = this.screenflow.fade ? this.screenflow.fade : 0.7;
                            }
                            this.dom_index.now = slide;
                            this.dom_index.prev = left;
                            this.dom_index.next = right;

                            this.assignClicks();

                            this.active = true;

                        }, this.active_delay);
                    }

                break;
                default:
                    // FADE
                    if(slide_next) {

                        slide_next.style.zIndex = this.zindex + 4;

                        setTimeout( () => {
                            slide.style.opacity = 1;
                        }, 50);
                        setTimeout( () => {
                            slide_next.parentNode.removeChild(slide_next);
                            this.dom_index.next = slide;

                            this.assignClicks();

                            this.active = true;
                        }, this.active_delay);
                    }
            }
            this.checkEdges();
        });


    },

    assignClicks() {

        if(this.mode === 3) {
            this.dom_index.prev.style.cursor = 'default';
            this.dom_index.prev.onclick = () => {
                if(this.loop || this.currentSlide !== 0 && this.active) {
                    this.prevSlide();
                }

            };

            this.dom_index.next.style.cursor = 'default';
            this.dom_index.next.onclick = () => {
                if(this.loop || this.currentSlide !== this.imageData.length-1 && this.active) {
                    this.nextSlide();
                }
            };

            if(this.clickable) {
                this.dom_index.now.style.cursor = 'pointer';
            }
            this.dom_index.now.onclick = () => {
                if(this.clickable && this.active) {
                    this.callback_slideClick();
                }
            };
        } else {
            if(this.clickable) {
                this.dom_index.next.style.cursor = 'pointer';
            }
            this.dom_index.next.onclick = () => {
                if(this.clickable && this.active) {
                    this.callback_slideClick();
                }
            };
        }
    },

    callback_slideReady() { this.trace('------------------ callback_slideReady'); },
    callback_slideShow()  { this.trace('------------------ callback_slideShow');  },
    callback_slidePrev()  { this.trace('------------------ callback_slidePrev');  },
    callback_slideNext()  { this.trace('------------------ callback_slideNext');  },
    callback_slideClick() { this.trace('------------------ callback_slideClick'); },
    callback_clickPrev()  { this.trace('------------------ callback_clickPrev');  },
    callback_clickNext()  { this.trace('------------------ callback_clickNext');  },
    callback_swipeLeft()  { this.trace('------------------ callback_swipeLeft');  },
    callback_swipeRight() { this.trace('------------------ callback_swipeRight'); },
    callback_swipeUp()    { this.trace('------------------ callback_swipeUp');    },
    callback_swipeDown()  { this.trace('------------------ callback_swipeDown');  },

    toggle(obj, bool) {

        if(bool) {
            obj.style.opacity = 0;
            obj.style.display = 'block';
            setTimeout( () => {
                obj.style.opacity = 1;
            }, 50);
        } else {
            obj.style.opacity = 0;
            setTimeout( () => {
                obj.style.display = 'none';
            }, 300);
        }
    },

    wait(bool) {
        this.active = false;

        if(bool) {
            this.toggle(this.dom_spin, 1);
            // this.toggle(this.dom_net, 1);
        } else {
            this.toggle(this.dom_spin, 0);
            // this.toggle(this.dom_net, 0);
        }

    },

    get(str) {

        return document.querySelector(str);
    },

    reflow() {

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

    setVendor(element, property, value) {
        
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

        switch(typeof arg)
        {
            case 'object':
                let lcounter  = 0;

                let onload = () => {
                    if(++lcounter === arg.length && callback) {
                        callback();
                    }
                };

                let onerror = (e) => { if(window.console) { console.log(e); } };

                for(let i = 0; i < arg.length; i++)
                {
                    if( !this.isLoaded(arg[i], this.loadedFiles) ) {
                        this.wait(1);
                        let imgs = new Image();
                            imgs.onload = onload;
                            imgs.onerror = onerror;
                            imgs.src = arg[i];
                        this.loadedFiles.push(arg[i]);
                    } else {
                        this.trace('already loaded '+ arg[i]);
                        onload();
                    }
                }
            break;
            default:
                if( !this.isLoaded(arg, this.loadedFiles) ) {
                    this.wait(1);
                    let img = new Image();
                        img.onload = () => {
                            callback();
                        };
                        img.onerror = (e) => { if(window.console) { console.log(e); } };
                        img.src = arg;
                    this.loadedFiles.push(arg);
                } else {
                    this.trace('already loaded '+ arg);
                    callback();
                }
        }
    },

    arrayRotate(arr, reverse){

        if(reverse) {
            arr.unshift(arr.pop());
            this.trace('array shifted left');

            this.movement = 'right';
        }
        else {
            arr.push(arr.shift());
            this.trace('array shifted right');

            this.movement = 'left';
        }
        return arr;
    },

    trace(str) {

        if(this.debug) {

            if(window.console) {
                window.console.log(str);
            }

            if( this.dom_debug ) {
                this.dom_debug.innerHTML += str + '<br>';
            }
        }
    },

    addClass(el, className) {

        if (el.classList) {
            el.classList.add(className);
        } else {
            el.className += ' ' + className;
        }
    },

    removeClass(el, className) {

        if (el.classList) {
            el.classList.remove(className);
        } else {
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    },

    swipedetect(el, callback){

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
        let handleswipe = callback || function (swipedir) {};

        touchsurface.addEventListener('touchstart', (e) => {
            let touchobj = e.changedTouches[0];
            swipedir = 'none';
            dist = 0;
            startX = touchobj.pageX;
            startY = touchobj.pageY;
            startTime = new Date().getTime(); // record time when finger first makes contact with surface
            // e.preventDefault()
        }, false);

        touchsurface.addEventListener('touchmove', (e) => {
            e.preventDefault(); // prevent scrolling when inside DIV
        }, false);

        touchsurface.addEventListener('touchend', (e) => {
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
        this.ready = false;
    }

};