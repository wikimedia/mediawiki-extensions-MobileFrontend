(function ( M, $ ) {
	var Overlay = M.require( 'Overlay' );

	QUnit.module( 'MobileFrontend: Overlay.js', {
		setup: function() {
			this.clock = this.sandbox.useFakeTimers();
		}
	} );

	QUnit.test( 'Simple overlay', 1, function () {
		var overlay = new Overlay( { heading: '<h2>Title</h2>', content: 'Text' } );
		overlay.show();
		strictEqual( overlay.$el[0].parentNode, $( '#mw-mf-viewport' )[0], 'In DOM' );
		overlay.hide();
	} );

	QUnit.test( 'HTML overlay', 2, function () {
		var TestOverlay, overlay;

		TestOverlay = Overlay.extend( {
			templatePartials: {
				content: M.template.compile( '<div class="content">YO</div>' )
			}
		} );
		overlay = new TestOverlay( { heading: 'Awesome' } );
		strictEqual( overlay.$el.find( 'h2' ).html(), 'Awesome' );
		strictEqual( overlay.$el.find( '.content' ).text(), 'YO' );
	} );

	QUnit.test( 'Close overlay', 1, function () {
		var overlay = new Overlay( { heading: '<h2>Title</h2>', content: 'Text' } );
		overlay.show();
		overlay.hide();
		this.clock.tick( 1000 );
		strictEqual( overlay.$el[0].parentNode, null, 'No longer in DOM' );
	} );
})( mw.mobileFrontend, jQuery );
