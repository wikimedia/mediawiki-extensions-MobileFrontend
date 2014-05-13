( function ( $, M ) {
	QUnit.module( 'MobileFrontend modules' );

	QUnit.test( 'define()', 1, function () {
		M.define( 'testModule1', 'test module 1' );
		QUnit.throws(
			function () {
				M.define( 'testModule1', 'again' );
			},
			/already exists/,
			"throws an error when module already exists"
		);
	} );

	QUnit.test( 'require()', 2, function () {
		QUnit.throws(
			function () {
				M.require( 'dummy' );
			},
			/not found/,
			"throws an error when module doesn't exist"
		);
		M.define( 'testModule2', 'test module 2' );
		strictEqual( M.require( 'testModule2' ), 'test module 2' );
	} );

	QUnit.module( 'MobileFrontend common functions' );

	QUnit.test( '#getSessionId', 3, function () {
		var sessionId = M.getSessionId();
		strictEqual( typeof sessionId, 'string', 'session ID is a string' );
		strictEqual( sessionId.length, 32, 'session ID is 32 chars long' );
		strictEqual( M.getSessionId(), sessionId, 'session ID is not regenerated if present' );
	} );

	QUnit.test( '#getSessionId', 3, function () {
		var sessionId = M.getSessionId();
		strictEqual( typeof sessionId, 'string', 'session ID is a string' );
		strictEqual( sessionId.length, 32, 'session ID is 32 chars long' );
		strictEqual( M.getSessionId(), sessionId, 'session ID is not regenerated if present' );
	} );

	QUnit.test( 'supportsPositionFixed()', function( assert ) {
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
			'AppleWebKit/533'
		];
		QUnit.expect( userAgents.length + userAgentsFail.length );

		$.each( userAgents, function( i, ua ) {
			assert.strictEqual( M.supportsPositionFixed( ua ), true, 'Success test case ' + i );
		} );
		$.each( userAgentsFail, function( i, ua ) {
			assert.strictEqual( M.supportsPositionFixed( ua ), false, 'Failure test case ' + i );
		} );
	} );
}( jQuery, mw.mobileFrontend ) );
