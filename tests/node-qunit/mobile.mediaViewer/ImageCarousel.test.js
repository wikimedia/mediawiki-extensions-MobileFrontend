let sandbox, ImageOverlay;
const
	util = require( '../../../src/mobile.startup/util' ),
	jQuery = require( '../utils/jQuery' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	sinon = require( 'sinon' ),
	mustache = require( '../utils/mustache' );

QUnit.module( 'MobileFrontend mobile.mediaViewer/ImageCarousel.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();
		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		ImageOverlay = require( '../../../src/mobile.mediaViewer/ImageCarousel' );

		this.image = {
			descriptionurl: 'https://commons.wikimedia.org/wiki/File:The_Montgomery,_San_Francisco.jpg',
			thumbheight: 1024,
			thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/The_Montgomery%2C_San_Francisco.jpg/676px-The_Montgomery%2C_San_Francisco.jpg',
			thumbwidth: 676,
			url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/The_Montgomery%2C_San_Francisco.jpg'
		};
		this.imageGateway = {
			getThumb: function () {
				return util.Deferred().resolve( {
					query: {
						pages: [
							{
								imageinfo: [ this.image ]
							}
						]
					}
				} );
			}
		};
		this.router = {
			getPath: function () {
				return '/media/File%3AA_cursiva.gif';
			}
		};
		this.thumbnails = [
			{
				filename: 'foo',
				getFileName: function () { return ''; },
				getPath: function () { return ''; },
				getDescription: function () { return ''; }
			},
			{
				filename: 'bar',
				getFileName: function () { return ''; },
				getPath: function () { return ''; },
				getDescription: function () { return ''; }
			}
		];
	},
	afterEach: function () {
		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'Shows details bar and image with successful api response', function ( assert ) {
	const overlay = new ImageOverlay( {
		gateway: this.imageGateway,
		title: decodeURIComponent( this.image.url ),
		caption: 'The Montgomery in 2012.',
		router: this.router,
		eventBus: {
			on: function () {}
		}
	} );

	return this.imageGateway.getThumb().then( function () {
		assert.strictEqual( overlay.$el.find( 'img' ).length, 1, 'Image is present.' );
		assert.strictEqual( overlay.$el.find( '.load-fail-msg' ).length, 0, 'Load error msg is not visible' );
		assert.strictEqual( overlay.$el.find( '.image-details.is-visible' ).length, 1, 'Details bar present' );
	} );
} );

QUnit.test( 'Shows error message with failed api response', function ( assert ) {
	const imageGateway = {
		getThumb: function () {
			return util.Deferred().reject( 'Load Error' );
		}
	};

	const overlay = new ImageOverlay( {
		gateway: imageGateway,
		title: decodeURIComponent( this.image.url ),
		caption: 'The Montgomery in 2012.',
		router: this.router,
		eventBus: {
			on: function () {}
		}
	} );

	return imageGateway.getThumb().catch( function () {
		assert.strictEqual( overlay.$el.find( '.load-fail-msg' ).length, 1, 'Load error msg is visible' );
		assert.strictEqual( overlay.$el.find( '.image-details.is-visible' ).length, 0, 'Details bar is hidden' );
	} );
} );

QUnit.test( 'Toggling of details is disabled when overlay has load failure', function ( assert ) {
	const imageGateway = {
		getThumb: function () {
			return util.Deferred().reject( 'Load Error' );
		}
	};

	const overlay = new ImageOverlay( {
		gateway: imageGateway,
		title: decodeURIComponent( this.image.url ),
		caption: 'The Montgomery in 2012.',
		thumbnails: this.thumbnails,
		router: this.router,
		eventBus: {
			on: function () {}
		}
	} );

	return imageGateway.getThumb().catch( function () {
		assert.strictEqual( overlay.$el.find( '.image-details.is-visible' ).length, 0, 'Details bar is hidden' );
		assert.notStrictEqual( overlay.$el.find( '.image-details' ), 'none', 'Slider buttons are shown' );
		assert.notStrictEqual( overlay.$el.find( '.prev' ), 'none', 'Slider buttons are still shown' );

		overlay.$el.find( '.image-wrapper' ).trigger( 'click' );

		// Assert that toggle didn't occur (would add display: none)
		assert.notStrictEqual( overlay.$el.find( '.image-details' ), 'none', 'Slider buttons are shown' );
		assert.notStrictEqual( overlay.$el.find( '.prev' ), 'none', 'Slider buttons are still shown' );
	} );
} );

QUnit.test( 'Toggling of details is enabled when overlay loads successfully', function ( assert ) {
	const overlay = new ImageOverlay( {
		gateway: this.imageGateway,
		title: decodeURIComponent( this.image.url ),
		caption: 'The Montgomery in 2012.',
		thumbnails: this.thumbnails,
		router: this.router,
		eventBus: {
			on: function () {}
		}
	} );

	return this.imageGateway.getThumb().then( function () {
		assert.strictEqual( overlay.$el.find( '.image-details.is-visible' ).length, 1, 'Details bar is shown' );
		assert.notStrictEqual( overlay.$el.find( '.image-details' ).css( 'display' ), 'none', 'Ensure display none rule is not set' );
		assert.notStrictEqual( overlay.$el.find( '.prev' ).css( 'display' ), 'none', 'Slider buttons are shown' );

		overlay.$el.find( '.image-wrapper' ).trigger( 'click' );

		assert.strictEqual( overlay.$el.find( '.image-details' ).css( 'display' ), 'none', 'Details bar is hidden' );
		assert.strictEqual( overlay.$el.find( '.slider-button' ).css( 'display' ), 'none', 'Slider buttons are hidden' );
	} );
} );
