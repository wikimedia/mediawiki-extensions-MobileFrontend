( function ( M, $ ) {
	var
		ScrollEndEventEmitter = M.require( 'mobile.scrollEndEventEmitter/ScrollEndEventEmitter' ),
		eventBus = M.require( 'mobile.startup/eventBusSingleton' );

	QUnit.module( 'MobileFrontend ScrollEndEventEmitter', {
		afterEach: function () {
			// Leave window at the top
			window.scrollTo( 0, 0 );
		}
	} );

	QUnit.test( '#constructor', function ( assert ) {
		var scrolledSpy = this.sandbox.spy( ScrollEndEventEmitter.prototype, '_onScroll' ),
			is = new ScrollEndEventEmitter( eventBus, 500 ),
			is2 = new ScrollEndEventEmitter( eventBus );
		assert.strictEqual( is.enabled, true,
			'Emission is enabled by default' );
		assert.strictEqual( is.threshold, 500, 'Threshold is saved' );
		assert.strictEqual( is2.threshold, 100,
			'Without a threshold we get a default' );

		// Scrolling has been bound to the global mobileFrontend handler
		eventBus.emit( 'scroll:throttled' );

		assert.strictEqual( scrolledSpy.callCount, 2,
			'Scrolling has been bound and is handler is called on scroll' );
	} );

	QUnit.test( 'emits load event', function ( assert ) {
		var done = assert.async(),
			is = new ScrollEndEventEmitter( eventBus );

		// Make sure we always have somewhere to scroll
		$( 'body' ).height( '9999px' );

		is.setElement( $( 'body' ) );
		is.on( ScrollEndEventEmitter.EVENT_SCROLL_END, function () {
			assert.ok( true, 'Load event emitted' );

			// Reset height
			$( 'body' ).css( 'height', '' );

			// Finish
			done();
		} );

		// Scroll to the bottom of the body
		window.scrollTo( 0, $( 'body' ).offset().top + $( 'body' ).outerHeight() );
		eventBus.emit( 'scroll:throttled' );
	} );

	QUnit.test( 'doesn\'t emit when disabled', function ( assert ) {
		var emitSpy = this.sandbox.spy( ScrollEndEventEmitter.prototype, 'emit' ),
			is = new ScrollEndEventEmitter( eventBus );
		is.setElement( $( 'body' ) );
		is.disable();
		// Scroll to top and bottom of the body
		window.scrollTo( 0, 0 );
		window.scrollTo( 0, $( 'body' ).offset().top + $( 'body' ).outerHeight() );
		eventBus.emit( 'scroll:throttled' );
		assert.strictEqual( emitSpy.called, false, 'emit should not be called' );
	} );

}( mw.mobileFrontend, jQuery ) );
