( function( M, $ ) {
	M.assertMode( [ 'alpha', 'beta', 'app' ] );

	function init( $el ) {
		$el.find( 'a.image, a.thumbimage' ).each( function() {
			var $a = $( this ), match = $a.attr( 'href' ).match( /[^\/]+$/ );

			if ( match ) {
				$a.on( M.tapEvent( 'click' ), function( ev ) {
					ev.preventDefault();
					M.router.navigate( '#/image/' + match[0] );
				} );
			}
		} );
	}

	// Add route
	function loadImageOverlay( title ) {
		var result = $.Deferred();
		mw.loader.using( 'mobile.mediaViewer', function() {
			var caption = $( 'a[href*="' + title + '"]' ).siblings( '.thumbcaption' ).text(),
				ImageOverlay = M.require( 'modules/mediaViewer/ImageOverlay' );

			result.resolve(
				new ImageOverlay( {
					title: decodeURIComponent( title ),
					caption: caption
				} )
			);
		} );
		return result;
	}
	M.overlayManager.add( /^\/image\/(.+)$/, loadImageOverlay );

	// FIXME: this should bind to only 1-2 events
	init( $( '#content_wrapper' ) );
	M.on( 'page-loaded', function( page ) {
		init( page.$el );
	} );
	M.on( 'section-rendered', init );
	M.on( 'photo-loaded', init );

}( mw.mobileFrontend, jQuery ) );
