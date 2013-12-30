( function( M,  $ ) {

	var LanguageOverlay = M.require( 'languagesNew/LanguageOverlay' );

	/**
	 * Hijack the Special:Languages link and replace it with a trigger to a LanguageOverlay
	 * that displays the same data
	 */
	function initButton() {
		var $langlink = $( '#page-secondary-actions .languageSelector' );

		if ( $langlink.length ) {
			$langlink.on( 'click', function ( e ) {
				e.preventDefault();

				var LoadingOverlay = M.require( 'LoadingOverlayNew' ),
					loadingOverlay = new LoadingOverlay();
				loadingOverlay.show();

				M.pageApi.getPageLanguages( mw.config.get( 'wgPageName' ) ).done( function ( data ) {
					var languageOverlay = new LanguageOverlay( {
							languages: data.languages,
							variants: data.variants
						} );
					loadingOverlay.hide();
					languageOverlay.show();
				} );
			} );
		}
	}

	$( initButton );
	M.on( 'page-loaded', initButton );

}( mw.mobileFrontend, jQuery ) );
