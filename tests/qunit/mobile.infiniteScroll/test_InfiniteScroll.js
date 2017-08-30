( function ( M, $ ) {
	var InfiniteScroll = M.require( 'mobile.infiniteScroll/InfiniteScroll' );

	QUnit.module( 'MobileFrontend InfiniteScroll', {
		teardown: function () {
			// Leave window at the top
			window.scrollTo( 0, 0 );
		}
	} );

	QUnit.test( '#constructor', function ( assert ) {
		var scrolledSpy = this.sandbox.spy( InfiniteScroll.prototype, '_onScroll' ),
			is = new InfiniteScroll( 500 ),
			is2 = new InfiniteScroll();
		assert.strictEqual( is.enabled, true,
			'Infinite scrolling is enabled by default' );
		assert.strictEqual( is.threshold, 500, 'Threshold is saved' );
		assert.strictEqual( is2.threshold, 100,
			'Without a threshold we get a default' );

		// Scrolling has been bound to the global mobileFrontend handler
		M.emit( 'scroll:throttled' );

		assert.ok( scrolledSpy.calledTwice,
			'Scrolling has been bound and is handler is called on scroll' );
	} );

	QUnit.test( 'emits load event', function ( assert ) {
		var asyncDone = $.Deferred(),
			is = new InfiniteScroll();

		// Make sure we always have somewhere to scroll
		$( 'body' ).height( '9999px' );

		is.setElement( $( 'body' ) );
		is.on( 'load', function () {
			assert.ok( true, 'Load event emitted' );

			// Reset height
			$( 'body' ).css( 'height', '' );

			// Finish
			asyncDone.resolve();
		} );

		// Scroll to the bottom of the body
		window.scrollTo( 0, $( 'body' ).offset().top + $( 'body' ).outerHeight() );
		M.emit( 'scroll:throttled' );
		return asyncDone;
	} );

	QUnit.test( 'doesn\'t emit when disabled', function ( assert ) {
		var emitSpy = this.sandbox.spy( InfiniteScroll.prototype, 'emit' ),
			is = new InfiniteScroll();
		is.setElement( $( 'body' ) );
		is.disable();
		// Scroll to top and bottom of the body
		window.scrollTo( 0, 0 );
		window.scrollTo( 0, $( 'body' ).offset().top + $( 'body' ).outerHeight() );
		M.emit( 'scroll:throttled' );
		assert.strictEqual( emitSpy.called, false, 'emit should not be called' );
	} );

}( mw.mobileFrontend, jQuery ) );
