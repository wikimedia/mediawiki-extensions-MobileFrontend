( function ( M, $ ) {

	var loader = M.require( 'loader' ),
		overlayManager = M.require( 'overlayManager' ),
		MobileWebClickTracking = M.require( 'loggingSchemas/SchemaMobileWebClickTracking' ),
		uiSchema = new MobileWebClickTracking( {}, 'MobileWebUIClickTracking' ),
		user = M.require( 'user' );

	// categories overlay
	overlayManager.add( /^\/categories$/, function () {
		var result = $.Deferred();

		loader.loadModule( 'mobile.categories', true ).done( function ( loadingOverlay ) {
			var CategoryOverlay = M.require( 'categories/CategoryOverlay' );

			loadingOverlay.hide();
			result.resolve( new CategoryOverlay( {
				isAnon: user.isAnon(),
				title: M.getCurrentPage().title
			} ) );
		} );
		return result;
	} );

	// add categories overlay
	overlayManager.add( /^\/categories\/add$/, function () {
		var result = $.Deferred();

		loader.loadModule( 'mobile.categories', true ).done( function ( loadingOverlay ) {
			var CategoryAddOverlay = M.require( 'categories/CategoryAddOverlay' );

			loadingOverlay.hide();
			result.resolve( new CategoryAddOverlay( {
				categories: mw.config.get( 'wgCategories' ),
				isAnon: user.isAnon(),
				title: M.getCurrentPage().title
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
