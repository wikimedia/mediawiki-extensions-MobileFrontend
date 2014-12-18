( function ( M, $ ) {
	/**
	 * Add routes to images and handle clicks
	 * @method
	 * @ignore
	 * @param {jQuery.Object} $el Object within which to look for images
	 */
	function init( $el ) {
		if ( !mw.config.get( 'wgImagesDisabled' ) ) {
			$el.find( 'a.image, a.thumbimage' ).each( function () {
				var $a = $( this ),
					match = $a.attr( 'href' ).match( /[^\/]+$/ );

				if ( match ) {
					$a.off();
					$a.on( 'click', function ( ev ) {
						ev.preventDefault();
						M.router.navigate( '#/image/' + match[0] );
					} );
				}
			} );
		}
	}

	/**
	 * Load image overlay
	 * @method
	 * @ignore
	 * @uses ImageOverlay
	 * @param {String} title Url of image
	 * @returns {jQuery.Deferred}
	 */
	function loadImageOverlay( title ) {
		var result = $.Deferred();
		M.loadModule( 'mobile.mediaViewer' ).done( function () {
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

	init( $( '#content_wrapper' ) );
	// for Special:Uploads
	M.on( 'photo-loaded', init );

}( mw.mobileFrontend, jQuery ) );
