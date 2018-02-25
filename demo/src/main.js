// ------------------------------------------------- //
// DO NOT TOUCH UNLESS YOU KNOW WHAT YOU'RE DOING    //
// ------------------------------------------------- //

let slideshow = new Carousel();
const resetVars = {
	debug: slideshow.debug,
	loop: slideshow.loop,
	currentSlide: slideshow.currentSlide,
	clickable: slideshow.clickable,
	mode: slideshow.mode,
	screenflow: slideshow.screenflow,
	active: slideshow.active,
	arrows: slideshow.arrows,
	slide: slideshow.slide
};

function init(){
	slideshow.init(document.getElementById('slideshow'), images);

	$('i').click(function(){

		switch($(this).attr('id')) {
			case 'mode0':
				slideshow.mode = 0;
			break;
			case 'mode1':
				slideshow.mode = 1;
			break;
			case 'mode2':
				slideshow.mode = 2;
			break;
			case 'mode3':
				slideshow.mode = 3;
			break;
		}
		
		quickReset();
	});
}

function quickReset() {
	slideshow.destroy();
	setTimeout(function(){
		slideshow.init(document.getElementById('slideshow'), images);
	}, 500);
}

$( document ).ready(init);

// ------------------------------------------------- //
// PLAYGROUND   									 //
// ------------------------------------------------- //

const images = [
	{
		src: 'https://c1.staticflickr.com/5/4758/26294215758_677bf9b965_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Grand Seiko Snowflake (SBGA211)',
			url: 'https://www.grand-seiko.com/collections/SBGA211'
		}
	},
	{
		src: 'https://farm9.staticflickr.com/8612/27669850714_79a89c35c5_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Huckleberry & Co. Atticus',
			url: 'https://www.kickstarter.com/projects/huckleberryandco/archibald-a-bauhaus-designed-automatic-watch-by-ha'
		}
	},
	{
		src: 'https://farm9.staticflickr.com/8829/28324854376_c8fefe36fe_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'StuckX The Bull',
			url: 'http://kck.st/1OzuQa7'
		}
	},
	{
		src: 'https://farm9.staticflickr.com/8214/28300693942_d8e0a99a10_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Redux COURG Type-A',
			url: 'https://www.kickstarter.com/projects/reduxwatch/redux-courg-hybrid-watches-with-missions-to-tackle'
		}
	},
	{
		src: 'https://farm1.staticflickr.com/571/23472287050_d0ba897e6f_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Visitor Calligraph Duneshore',
			url: 'http://kck.st/1ulYPMI'
		}
	},
	{
		src: 'https://farm1.staticflickr.com/618/22135977040_82c258665b_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Zelos Abyss',
			url: 'http://kck.st/1CQDHBV'
		}
	},
	{
		src: 'https://farm6.staticflickr.com/5801/30396986435_f2f33ef5c7_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'XFrame Vulcan',
			url: 'http://kck.st/1LxXm9U'
		}
	},
	{
		src: 'https://farm1.staticflickr.com/693/22315911284_9e9255c24b_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Smith & Bradley Ambush',
			url: 'http://kck.st/1k3BZoY'
		}
	},
	{
		src: 'https://farm1.staticflickr.com/557/20000385931_4fdc223e2f_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Apple Watch',
			url: 'https://www.apple.com/shop/buy-watch/apple-watch'
		}
	},
	{
		src: 'https://farm9.staticflickr.com/8864/18230308095_c2e85ac103_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'LIV GX1',
			url: 'http://kck.st/1u5dOsz'
		}
	},
	{
		src: 'https://farm8.staticflickr.com/7781/18370711672_b141c07373_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Rolex Milgauss',
			url: 'https://www.rolex.com/watches/milgauss/m116400gv-0001.html'
		}
	},
	{
		src: 'https://farm8.staticflickr.com/7622/17183213822_835fe60486_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Girard Perregaux',
			url: 'https://www.flickr.com/photos/nargalzius/sets/72157652034902315'
		}
	},
	{
		src: 'https://farm9.staticflickr.com/8749/17111139906_f5f504e2d5_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Division Furtive Type-50',
			url: 'http://kck.st/1tw5Tk7'
		}
	},
	{
		src: 'https://farm1.staticflickr.com/370/19520096038_af29492237_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Eone Bradley',
			url: 'http://kck.st/1av4Cpy'
		}
	},
	{
		src: 'https://farm1.staticflickr.com/349/19659604440_bc370c6e23_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Panerai Luminor Marina',
			url: 'http://www.panerai.com/en/collections/watch-collection/luminor.html'
		}
	},
	{
		src: 'https://farm1.staticflickr.com/297/19712709261_dba045cff8_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Henry Juskevicius Solid Watch',
			url: 'http://kck.st/jg4BRI'
		}
	},
	{
		src: 'https://farm1.staticflickr.com/388/19520112118_3b50180d53_o.jpg',
		info: {
			preload: 'https://joystick.cachefly.net/resources/images/sp.png',
			title: 'Issey Miyake TO',
			url: 'http://www.isseymiyake-watch.com/eg/to_automatic/detail.html'
		}
	}
];

// slideshow.debug = false;
// slideshow.slide = 'contain';
// slideshow.mode = 3;
// slideshow.loop = true;
// slideshow.clickable = true;
// slideshow.arrows = {
// 	size: 100,
// 	margin: -20
// };
// slideshow.screenflow = {
// 	autostyle: false,
// 	width: 320,
// 	height: 240,
// 	overlap: -20,
// 	scale: 0.5,
// 	fade: 0.7
// };

// slideshow.callback_slideShow = function() {
// 	console.log( slideshow.currentInfo );
// 	$('#infowindow').text(slideshow.currentInfo.title)
// };

// slideshow.callback_slideClick = function() {
// 	window.open( slideshow.currentInfo.url );
// };

