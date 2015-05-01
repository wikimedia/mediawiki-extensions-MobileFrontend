( function ( $, M ) {
	var Browser = M.require( 'Browser' ),
		$html = $( 'html' );

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

	QUnit.test( 'supportsPositionFixed()', function ( assert ) {
		var userAgents, userAgentsFail;
		userAgents = [
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36',
			'Firefox',
			// IE 10
			'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
			// IE 11
			'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko',
			// When Trident hits 10
			'Mozilla/5.0 (Windows NT 6.3; Trident/10.0; rv:11.0) like Gecko',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/600 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/1300 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36'
		];
		userAgentsFail = [
			'Android 1',
			// IE 5.5
			'Mozilla/4.0 (compatible; MSIE 5.5; Windows NT 6.1; chromeframe/12.0.742.100; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C)',
			// IE 6
			'Mozilla/5.0 (compatible; MSIE 6.0; Windows NT 5.1)',

			// IE 7
			'Mozilla/5.0 (compatible; MSIE 7.0; Windows NT 5.0; Trident/4.0; FBSMTWB; .NET CLR 2.0.34861; .NET CLR 3.0.3746.3218; .NET CLR 3.5.33652; msn OptimizedIE8;ENUS)',
			// IE 9
			'Mozilla/5.0(compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0',
			// Older WebKit based browsers
			'AppleWebKit/400',
			'AppleWebKit/20',
			'AppleWebKit/533',
			'AppleWebKit/54',
			'AppleWebKit/6'
		];
		QUnit.expect( userAgents.length + userAgentsFail.length );

		$.each( userAgents, function ( i, ua ) {
			var browser = new Browser( ua, $html );
			assert.strictEqual( browser.supportsPositionFixed(), true, 'Success test case ' + ua );
		} );
		$.each( userAgentsFail, function ( i, ua ) {
			var browser = new Browser( ua, $html );
			assert.strictEqual( browser.supportsPositionFixed(), false, 'Failure test case ' + ua );
		} );
	} );

	QUnit.test( 'Methods are cached', 15, function ( assert ) {
		function cache( obj, method ) {
			return obj[ '__cache' + obj[ method ].cacheId ];
		}
		function keys( obj ) {
			return $.map( obj, function ( key ) {
				return key;
			} );
		}

		var ipad = new Browser( 'Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko)', $html ),
			iphone = new Browser( 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/8.0 Mobile/11A465 Safari/9537.53', $html ),
			android2 = new Browser( 'Android 2', $html );

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
		// NOTE: In the constructor isAndroid2 is called with empty and isIos
		// with 4 and 5, so account for that on the assertions:
		assert.strictEqual( keys( cache( ipad, 'isIos' ) ).length, 4 );
		assert.strictEqual( keys( cache( ipad, 'isAndroid2' ) ).length, 1 );
		assert.strictEqual( keys( cache( android2, 'isIos' ) ).length, 3 );
		assert.strictEqual( keys( cache( android2, 'isAndroid2' ) ).length, 1 );
		assert.strictEqual( keys( cache( iphone, 'isAndroid2' ) ).length, 1 );
		assert.strictEqual( keys( cache( iphone, 'isIos' ) ).length, 4 );

		// Mess up the cache and see if the objects return the correct value when
		// called again with the same arguments
		cache( ipad, 'isAndroid2' )[ '' ] = 'for sure';
		assert.strictEqual( ipad.isAndroid2(), 'for sure' );

	} );

}( jQuery, mw.mobileFrontend ) );
