( function( M, $ ) {

	var LanguageOverlay = M.require( 'languages/LanguageOverlay' );

	M.overlayManager.add( /^\/languages$/, function() {
		var LoadingOverlay = M.require( 'LoadingOverlayNew' ),
			loadingOverlay = new LoadingOverlay(),
			result = $.Deferred();

		loadingOverlay.show();

		M.pageApi.getPageLanguages( mw.config.get( 'wgPageName' ) ).done( function ( data ) {
			loadingOverlay.hide();
			result.resolve( new LanguageOverlay( {
				languages: data.languages,
				variants: data.variants
			} ) );
		} );

		return result;
	} );

	/**
	 * Hijack the Special:Languages link and replace it with a trigger to a LanguageOverlay
	 * that displays the same data
	 */
	function initButton() {
		$( '#page-secondary-actions .languageSelector' ).on( M.tapEvent( 'click' ), function( ev ) {
			ev.preventDefault();
			M.router.navigate( '/languages' );
		} );
	}

	$( initButton );
	M.on( 'page-loaded', initButton );

}( mw.mobileFrontend, jQuery ) );
