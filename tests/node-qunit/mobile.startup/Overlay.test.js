var
	sinon = require( 'sinon' ),
	jQuery = require( '../utils/jQuery' ),
	mfExtend = require( '../../../src/mobile.startup/mfExtend' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	util = require( '../../../src/mobile.startup/util' ),
	Hogan = require( 'hogan.js' ),
	Overlay,
	sandbox;

QUnit.module( 'MobileFrontend: Overlay.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();

		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
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
	var overlay = new Overlay( {
			heading: '<h2>Overlay Title</h2>'
		} ),
		headingNode;

	headingNode = overlay.$el.find( 'h2:contains("Overlay Title")' );

	assert.strictEqual( headingNode.length, 1 );
} );

QUnit.test( '#make', function ( assert ) {
	var overlay = Overlay.make( {
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
	var overlay;

	function TestOverlay() {
		Overlay.apply( this, arguments );
	}

	mfExtend( TestOverlay, Overlay, {
		templatePartials: util.extend( {}, Overlay.prototype.templatePartials, {
			content: Hogan.compile( '<div class="content">YO</div>' )
		} )
	} );
	overlay = new TestOverlay( {
		heading: 'Awesome'
	} );

	assert.strictEqual( overlay.$el.find( 'h2' ).html(), 'Awesome' );
	assert.strictEqual( overlay.$el.find( '.content' ).text(), 'YO' );
} );

QUnit.test( 'Close overlay', function ( assert ) {
	var overlay = new Overlay( {
		heading: '<h2>Title</h2>',
		content: 'Text'
	} );

	overlay.show();
	overlay.hide();

	assert.strictEqual( overlay.$el[ 0 ].parentNode, null, 'No longer in DOM' );
} );
