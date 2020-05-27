const
	sinon = require( 'sinon' ),
	jQuery = require( '../utils/jQuery' ),
	mfExtend = require( '../../../src/mobile.startup/mfExtend' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	mustache = require( '../utils/mustache' ),
	oo = require( '../utils/oo' ),
	util = require( '../../../src/mobile.startup/util' );
let
	Overlay,
	sandbox;

QUnit.module( 'MobileFrontend: Overlay.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();

		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		mustache.setUp( sandbox, global );
		Overlay = require( '../../../src/mobile.startup/Overlay' );

		// jsdom will throw "Not implemented" errors if we don't stub
		// window.scrollTo
		sandbox.stub( global.window, 'scrollTo' );

		// Create a dummy mw-mf-viewport if none exists
		if ( !util.getDocument().find( '#mw-mf-viewport' ).length ) {
			this.$viewport = util.parseHTML( '<div>' ).attr( 'id', 'mw-mf-viewport' ).appendTo( 'body' );
		}
	},
	afterEach: function () {
		if ( this.$viewport ) {
			this.$viewport.remove();
		}

		jQuery.tearDown();
		sandbox.restore();
	}
} );

QUnit.test( 'Simple overlay', function ( assert ) {
	const overlay = new Overlay( {
		heading: '<h2>Overlay Title</h2>'
	} );

	const $headingNode = overlay.$el.find( 'h2:contains("Overlay Title")' );

	assert.strictEqual( $headingNode.length, 1 );
} );

QUnit.test( '#make', function ( assert ) {
	const overlay = Overlay.make( {
		heading: 'Fresh from factory'
	}, new Overlay( {
		className: 'overlay-child',
		heading: 'overlay in overlay'
	} ) );

	assert.strictEqual( overlay.$el.find( '.overlay-child' ).length, 1, 'there is an overlay in the overlay!' );
	assert.strictEqual(
		overlay.$el.find( '.overlay-title' ).eq( 0 ).text().trim(),
		'Fresh from factory',
		'First heading found'
	);
	assert.strictEqual(
		overlay.$el.find( '.overlay-content .overlay-title' ).text().trim(),
		'overlay in overlay',
		'Second heading found in overlay-content'
	);
} );

QUnit.test( 'HTML overlay', function ( assert ) {
	function TestOverlay() {
		Overlay.apply( this, arguments );
	}

	mfExtend( TestOverlay, Overlay, {
		templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
			content: util.template( '<div class="content">YO</div>' )
		} )
	} );
	const overlay = new TestOverlay( {
		heading: 'Awesome'
	} );

	assert.strictEqual( overlay.$el.find( 'h2' ).html(), 'Awesome' );
	assert.strictEqual( overlay.$el.find( '.content' ).text(), 'YO' );
} );

QUnit.test( 'headerActions property', function ( assert ) {
	const overlays = [
		new Overlay( {} ),
		new Overlay( {
			headerActions: [
				{ $el: util.parseHTML( '<div>' ) }
			]
		} )
	];
	assert.strictEqual( overlays[0].$el.find( '.header-action' ).length, 0,
		'Overlays do not have header actions by default' );
	assert.strictEqual( overlays[1].$el.find( '.header-action > *' ).length, 1,
		'headerActions will be inserted into the header-action container' );
} );

QUnit.test( 'onBeforeExit', function ( assert ) {
	const spies = [],
		overlays = [
			new Overlay( {} ),
			new Overlay( {
				onBeforeExit: function () {}
			} ),
			new Overlay( {
				onBeforeExit: function ( exit ) {
					exit();
				}
			} )
		];
	overlays.forEach( function ( overlay ) {
		spies.push( sandbox.spy( overlay, 'hide' ) );
		overlay.onExitClick( new Event( 'click' ) );
	} );
	assert.strictEqual( spies[0].calledOnce, true, 'Overlay 1 hide method called' );
	assert.strictEqual( spies[1].calledOnce, false, 'Overlay 2 does not call the exit function' );
	assert.strictEqual( spies[2].calledOnce, true, 'Overlay 3 calls the exit function' );
} );

QUnit.test( 'Close overlay', function ( assert ) {
	const overlay = new Overlay( {
		heading: '<h2>Title</h2>',
		content: 'Text'
	} );

	overlay.show();
	overlay.hide();

	assert.strictEqual( overlay.$el[ 0 ].parentNode, null, 'No longer in DOM' );
} );
