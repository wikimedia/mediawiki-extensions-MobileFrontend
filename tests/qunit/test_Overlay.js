( function ( M, $ ) {
	var Overlay = M.require( 'Overlay' );

	QUnit.module( 'MobileFrontend: Overlay.js', {
		setup: function () {
			this.clock = this.sandbox.useFakeTimers();
		}
	} );

	QUnit.test( 'Simple overlay', 1, function ( assert ) {
		var overlay = new Overlay( {
			heading: '<h2>Title</h2>',
			content: 'Text'
		} );
		overlay.show();
		assert.strictEqual( overlay.$el[ 0 ].parentNode, $( '#mw-mf-viewport' )[ 0 ], 'In DOM' );
		overlay.hide();
	} );

	QUnit.test( 'HTML overlay', 2, function ( assert ) {
		var TestOverlay, overlay;

		TestOverlay = Overlay.extend( {
			templatePartials: {
				content: mw.template.compile( '<div class="content">YO</div>', 'hogan' )
			}
		} );
		overlay = new TestOverlay( {
			heading: 'Awesome'
		} );
		assert.strictEqual( overlay.$el.find( 'h2' ).html(), 'Awesome' );
		assert.strictEqual( overlay.$el.find( '.content' ).text(), 'YO' );
	} );

	QUnit.test( 'Close overlay', 1, function ( assert ) {
		var overlay = new Overlay( {
			heading: '<h2>Title</h2>',
			content: 'Text'
		} );
		overlay.show();
		overlay.hide();
		this.clock.tick( 1000 );
		assert.strictEqual( overlay.$el[ 0 ].parentNode, null, 'No longer in DOM' );
	} );
} )( mw.mobileFrontend, jQuery );
