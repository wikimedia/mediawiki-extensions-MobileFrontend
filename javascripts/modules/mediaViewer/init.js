( function( M, $ ) {
	function init( $el ) {
		if ( !mw.config.get( 'wgImagesDisabled' ) ) {
			$el.find( 'a.image, a.thumbimage' ).each( function() {
				var $a = $( this ), match = $a.attr( 'href' ).match( /[^\/]+$/ );

				if ( match ) {
					$a.off();
					$a.on( M.tapEvent( 'click' ), function( ev ) {
						ev.preventDefault();
						M.router.navigate( '#/image/' + match[0] );
					} );
				}
			} );
		}
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
	M.on( 'photo-loaded', init );

}( mw.mobileFrontend, jQuery ) );
