// FIXME: temporary hack to make sure we log into Commons
( function( $ ) {
	var loginHandshakeUrl = mw.config.get( 'wgMFLoginHandshakeUrl' );

	// using feature detection used by http://diveintohtml5.info/storage.html
	try {
		// redirect to Commons Special:LoginHandshake if it's the first visit
		if (
			'localStorage' in window && window.localStorage !== null &&
			!localStorage.getItem( 'loginHandshaked' )
		) {
			if ( document.referrer !== loginHandshakeUrl ) {
				// only do the handshake if we haven't done it already on this device/browser
				localStorage.setItem( 'loginHandshaked', '1' );
				document.location = loginHandshakeUrl;
			}
		}
	} catch ( e ) {}

	$( function() {
		var $commonsImage = $( 'img[title="commons.wikimedia.org"]' );

		function done() {
			$( '#mw-returnto' ).addClass( 'loaded' );
		}

		// make sure Commons image is loaded after login
		if ( $commonsImage.length ) {
			// http://stackoverflow.com/a/3877079/365238
			$commonsImage.
				one( 'load', done ).
				// show the return to link anyway even if image fails to load
				one( 'error', done ).
				each( function() {
					if ( this.complete ) {
						// http://stackoverflow.com/a/1977898/365238
						done();
					}
				} );
		} else {
			done();
		}
	} );

}( jQuery ) );
