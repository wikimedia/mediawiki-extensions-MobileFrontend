( function ( M, $ ) {

	M.overlayManager.add( /^\/categories$/, function () {
		var result = $.Deferred();

		M.loadModule( 'mobile.categories', true ).done( function ( loadingOverlay ) {
			var CategoryOverlay = M.require( 'categories/CategoryOverlay' );

			loadingOverlay.hide();
			result.resolve( new CategoryOverlay( {
					categories: mw.config.get( 'wgCategories' )
				} )
			);
		} );
		return result;
	} );

	/*
	 * Enable the categories button
	 */
	function initButton() {
		$( '.categoryButton' ).removeClass( 'hidden' );
	}

	$( initButton );

}( mw.mobileFrontend, jQuery ) );
