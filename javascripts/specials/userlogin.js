// FIXME: temporary hack to make sure we log into Commons
( function( M, $ ) {
	var $commonsImage = $( 'img[title="commons.wikimedia.org"]' );

	function done() {
		$( '#mw-returnto' ).addClass( 'loaded' );
	}

	function error() {
		M.log( 'MobileWebCentralAuthError', {
			token: M.getSessionId(),
			mobileMode: mw.config.get( 'wgMFMode' ),
			userAgent: window.navigator.userAgent,
			error: 'commonsImageError'
		} );
		// show the return to link anyway after logging the event
		done();
	}

	// define event logging schema here until
	// https://gerrit.wikimedia.org/r/#/c/52053/ is merged and/or we properly
	// track dependencies for event logging schemas
	if ( mw.eventLog ) {
		mw.eventLog.setSchema("MobileWebCentralAuthError", {"schema":{"properties":{"token":{"type":"string","required":true,"description":"User token"},"error":{"type":"string","required":true,"enum":["commonsImageError"],"description":"Kind of error. commonsImageError - when CentralAuth Commons image failed to load (detected in JavaScript)"},"mobileMode":{"type":"string","required":true,"enum":["stable","beta","alpha"],"description":"Whether the user is seeing the regular non-beta, beta, or alpha version of the mobile site."},"userAgent":{"type":"string","description":"Useragent string."}}},"revision":5294684});
	}

	if ( $commonsImage.length ) {
		// http://stackoverflow.com/a/3877079/365238
		$commonsImage.
			one( 'load', done ).
			on( 'error', error ).
			each( function() {
				if ( this.complete ) {
					// http://stackoverflow.com/a/1977898/365238
					if ( this.naturalWidth === 0 ) {
						error();
					} else {
						done();
					}
				}
			} );
	} else {
		done();
	}
}( mw.mobileFrontend, jQuery ) );
