( function ( M, $ ) {

	var MobileWebClickTracking = M.require( 'loggingSchemas/SchemaMobileWebClickTracking' ),
		uiSchema = new MobileWebClickTracking( {}, 'MobileWebUIClickTracking' );

	M.overlayManager.add( /^\/categories$/, function () {
		var result = $.Deferred();

		M.loadModule( 'mobile.categories', true ).done( function ( loadingOverlay ) {
			var CategoryOverlay = M.require( 'categories/CategoryOverlay' );

			loadingOverlay.hide();
			result.resolve( new CategoryOverlay( {
				categories: mw.config.get( 'wgCategories' )
			} ) );
		} );
		return result;
	} );

	/**
	 * Enable the categories button
	 * @ignore
	 */
	function initButton() {
		$( '.category-button' )
			.removeClass( 'hidden' )
			.on( 'click', function () {
				uiSchema.log( {
					name: 'category-button'
				} );
			} );
	}

	$( initButton );

}( mw.mobileFrontend, jQuery ) );
