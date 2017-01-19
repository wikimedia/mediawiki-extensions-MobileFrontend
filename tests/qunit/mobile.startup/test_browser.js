( function ( $, M ) {
	var Browser = M.require( 'mobile.browser/Browser' ),
		// Use an empty html element to avoid calling methods in _fixIosLandscapeBug
		$html = $( '<html>' );

	QUnit.module( 'Browser.js' );

	QUnit.test( 'isIos()', 8, function ( assert ) {
		var browser = new Browser( 'Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko)', $html ),
			browser4 = new Browser( 'Mozilla/5.0 (iPad; CPU OS 4_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko)', $html ),
			browser5 = new Browser( 'Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko)', $html ),
			browser2 = new Browser( 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/8.0 Mobile/11A465 Safari/9537.53', $html );

		assert.strictEqual( browser.isIos(), true );
		assert.strictEqual( browser.isIos( 8 ), false );
		assert.strictEqual( browser.isIos( 4 ), false );
		assert.strictEqual( browser.isIos( 5 ), false );
		assert.strictEqual( browser2.isIos(), true );
		assert.strictEqual( browser2.isIos( 8 ), true );
		assert.strictEqual( browser4.isIos( 4 ), true );
		assert.strictEqual( browser5.isIos( 5 ), true );
	} );

	QUnit.test( 'Methods are cached', 15, function ( assert ) {
		var ipad = new Browser( 'Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko)', $html ),
			iphone = new Browser( 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/8.0 Mobile/11A465 Safari/9537.53', $html ),
			android2 = new Browser( 'Android 2', $html );

		function cache( obj, method ) {
			return obj[ '__cache' + obj[ method ].cacheId ];
		}
		function keys( obj ) {
			return $.map( obj, function ( key ) {
				return key;
			} );
		}

		// Check that the same methods across different instances have their own
		// cache and don't interfere with one another
		assert.strictEqual( ipad.isIos(), true );
		assert.strictEqual( ipad.isIos( 8 ), false );
		assert.strictEqual( ipad.isAndroid2(), false );
		assert.strictEqual( android2.isAndroid2(), true );
		assert.strictEqual( android2.isIos( 8 ), false );
		assert.strictEqual( iphone.isIos(), true );
		assert.strictEqual( iphone.isIos( 8 ), true );
		assert.strictEqual( iphone.isAndroid2(), false );

		// Check that the caches have been filled
		// NOTE: In the constructor isAndroid2 is called with empty
		// so account for that on the assertions:
		assert.strictEqual( keys( cache( ipad, 'isIos' ) ).length, 2, 'isIos on ipad cached as expected' );
		assert.strictEqual( keys( cache( ipad, 'isAndroid2' ) ).length, 1, 'isAndroid2 on ipad cached as expected' );
		assert.strictEqual( keys( cache( android2, 'isIos' ) ).length, 1, 'isIos on android cached as expected' );
		assert.strictEqual( keys( cache( android2, 'isAndroid2' ) ).length, 1, 'isAndroid2 on android2 cached as expected' );
		assert.strictEqual( keys( cache( iphone, 'isAndroid2' ) ).length, 1, 'isAndroid2 on iphone cached as expected' );
		assert.strictEqual( keys( cache( iphone, 'isIos' ) ).length, 2, 'isIos on iphone cached as expected' );

		// Mess up the cache and see if the objects return the correct value when
		// called again with the same arguments
		cache( ipad, 'isAndroid2' )[ '' ] = 'for sure';
		assert.strictEqual( ipad.isAndroid2(), 'for sure' );

	} );

}( jQuery, mw.mobileFrontend ) );
