var
	sinon = require( 'sinon' ),
	jQuery = require( '../utils/jQuery' ),
	mfExtend = require( '../../../src/mobile.startup/mfExtend' ),
	dom = require( '../utils/dom' ),
	mediaWiki = require( '../utils/mw' ),
	oo = require( '../utils/oo' ),
	util = require( '../../../src/mobile.startup/util' ),
	Hogan = require( 'hogan.js' ),
	Overlay, Scroverlay,
	sandbox;

QUnit.module( 'MobileFrontend: Overlay.js', {
	beforeEach: function () {
		sandbox = sinon.sandbox.create();

		dom.setUp( sandbox, global );
		jQuery.setUp( sandbox, global );
		oo.setUp( sandbox, global );
		mediaWiki.setUp( sandbox, global );
		Overlay = require( '../../../src/mobile.startup/Overlay' );
		Scroverlay = function Scroverlay() {
			Overlay.apply( this, arguments );
		};

		mfExtend( Scroverlay, Overlay, {
			emulateScrolling: true
		} );

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

QUnit.test( 'headerActions property', function ( assert ) {
	var overlays = [
		new Overlay( {} ),
		new Overlay( {
			headerActions: [
				{ $el: util.parseHTML( '<div>' ) }
			]
		} ),
		new Overlay( {
			headerButtons: [
				{
					href: '#',
					className: 'foo',
					disabled: true,
					msg: 'banana'
				}
			]
		} ),
		new Overlay( {
			headerButtons: [
				{
					href: '#',
					className: 'foo',
					disabled: true,
					msg: 'banana'
				}
			],
			headerActions: [
				{ $el: util.parseHTML( '<div>' ) },
				{ $el: util.parseHTML( '<button>' ) }
			]
		} )
	];
	assert.strictEqual( overlays[0].$el.find( '.header-action' ).length, 0,
		'Overlays do not have header actions by default' );
	assert.strictEqual( overlays[1].$el.find( '.header-action > *' ).length, 1,
		'headerActions will be inserted into the header-action container' );
	assert.strictEqual( overlays[2].$el.find( '.header-action > *' ).length, 1,
		'headerButtons will be constructed from headerButtons into header-action container' );
	assert.strictEqual( overlays[3].$el.find( '.header-action > *' ).length, 3,
		'headerButtons and header actions can be mixed if necessary' );
} );

QUnit.test( 'onBeforeExit', function ( assert ) {
	var spies = [],
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
	var overlay = new Overlay( {
		heading: '<h2>Title</h2>',
		content: 'Text'
	} );

	overlay.show();
	overlay.hide();

	assert.strictEqual( overlay.$el[ 0 ].parentNode, null, 'No longer in DOM' );
} );

QUnit.test( 'setupEmulatedIosOverlayScrolling', function ( assert ) {
	var done = assert.async(),
		defaultNotIoSOverlay = new Scroverlay( {} ),
		defaultOverlay = new Scroverlay( {} ),
		noHeaderOverlay = new Scroverlay( {
			noHeader: true
		} ),
		spyResizeContent = sandbox.spy( Scroverlay.prototype, '_resizeContent' ),
		spyDefault = sandbox.spy( defaultOverlay.$el.find( '.overlay-content' )[0],
			'addEventListener' ),
		spyNotFixed = sandbox.spy( noHeaderOverlay.$el.find( '.overlay-content' )[0],
			'addEventListener' );

	// setup emulated ios scrolling
	defaultOverlay.isIos = true;
	noHeaderOverlay.isIos = true;
	defaultOverlay.setupEmulatedIosOverlayScrolling();
	noHeaderOverlay.setupEmulatedIosOverlayScrolling();
	defaultNotIoSOverlay.setupEmulatedIosOverlayScrolling();

	// account for setTimeout in setupEmulatedIosOverlayScrolling
	setTimeout( function () {
		assert.strictEqual( spyDefault.calledTwice, true,
			'Two events listened for' );
		assert.strictEqual( spyNotFixed.notCalled, true,
			'if no fixed header addEventListener is not called' );
		assert.strictEqual( spyResizeContent.calledOnce, true,
			'Resize content only run for defaultOverlay' );
		done();
	}, 500 );
} );

QUnit.test( 'show', function ( assert ) {
	var defaultOverlay = new Scroverlay( {} ),
		noHeaderOverlay = new Scroverlay( {
			noHeader: true
		} ),
		windowSpy = sandbox.spy( util.getWindow()[ 0 ],
			'addEventListener' );

	// setup emulated ios scrolling
	noHeaderOverlay.isIos = true;
	defaultOverlay.show();
	noHeaderOverlay.show();

	// account for setTimeout in setupEmulatedIosOverlayScrolling
	assert.strictEqual( windowSpy.called, false,
		'no listener added to window on show for non-iOS overlays and no header iOS overlays' );
	defaultOverlay.isIos = true;
	defaultOverlay.show();
	assert.strictEqual( windowSpy.called, true,
		'listener added to window on show for iOS overlays with header' );
} );
