( function ( M, $ ) {
	var InfiniteScroll = M.require( 'mobile.infiniteScroll/InfiniteScroll' );

	QUnit.module( 'MobileFrontend InfiniteScroll', {
		teardown: function () {
			// Remove all scroll events after each test
			$( window ).off( 'scroll' );
		}
	} );

	QUnit.test( '#constructor', 4, function ( assert ) {
		var scrolledSpy = this.sandbox.spy( InfiniteScroll.prototype, '_onScroll' ),
			is = new InfiniteScroll( 500 ),
			is2 = new InfiniteScroll();
		assert.strictEqual( is.enabled, true,
			'Infinite scrolling is enabled by default' );
		assert.strictEqual( is.threshold, 500, 'Threshold is saved' );
		assert.strictEqual( is2.threshold, 100,
			'Without a threshold we get a default' );

		// Scrolling has been bound to the window
		$( window ).trigger( 'scroll' );
		assert.ok( scrolledSpy.calledTwice,
			'Scrolling has been bound and is handler is called on scroll' );
	} );

	QUnit.test( 'emits load event', 1, function ( assert ) {
		var asyncDone = assert.async(),
			is = new InfiniteScroll();

		// Make sure we always have somewhere to scroll
		$( 'body' ).height( '9999px' );

		is.setElement( $( 'body' ) );
		is.on( 'load', function () {
			assert.ok( true, 'Load event emitted' );

			// Reset height
			$( 'body' ).css( 'height', '' );

			// Finish
			asyncDone();
		} );

		// Scroll to the bottom of the body
		window.scrollTo( 0, $( 'body' ).offset().top + $( 'body' ).outerHeight() );
	} );

	QUnit.test( 'doesn\'t emit when disabled', 1, function ( assert ) {
		var emitSpy = this.sandbox.spy( InfiniteScroll.prototype, 'emit' ),
			is = new InfiniteScroll();
		is.setElement( $( 'body' ) );
		is.disable();
		// Scroll to top and bottom of the body
		window.scrollTo( 0, 0 );
		window.scrollTo( 0, $( 'body' ).offset().top + $( 'body' ).outerHeight() );
		assert.strictEqual( emitSpy.called, false, 'emit should not be called' );
	} );

}( mw.mobileFrontend, jQuery ) );
