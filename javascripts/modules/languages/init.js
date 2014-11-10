( function ( M, $ ) {

	var MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' );

	M.overlayManager.add( /^\/languages$/, function () {
		var result = $.Deferred();

		M.loadModule( 'mobile.languages', true ).done( function ( loadingOverlay ) {
			var LanguageOverlay = M.require( 'languages/LanguageOverlay' );

			M.pageApi.getPageLanguages( mw.config.get( 'wgPageName' ) ).done( function ( data ) {
				loadingOverlay.hide();
				result.resolve( new LanguageOverlay( {
					languages: data.languages,
					variants: data.variants
				} ) );
			} );
		} );
		return result;
	} );

	/*
	 * Hijack the Special:Languages link and replace it with a trigger to a LanguageOverlay
	 * that displays the same data
	 */
	function initButton() {
		$( '#page-secondary-actions .languageSelector' ).on( 'click', function ( ev ) {
			ev.preventDefault();
			M.router.navigate( '/languages' );
			MobileWebClickTracking.log( 'languages' );
		} );
	}

	$( initButton );

}( mw.mobileFrontend, jQuery ) );
