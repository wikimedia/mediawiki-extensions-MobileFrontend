( function ( M, $ ) {

	var loader = M.require( 'mobile.startup/rlModuleLoader' ),
		overlayManager = M.require( 'skins.minerva.scripts/overlayManager' ),
		user = M.require( 'mobile.startup/user' );

	// categories overlay
	overlayManager.add( /^\/categories$/, function () {
		var result = $.Deferred();

		loader.loadModule( 'mobile.categories.overlays', true ).done( function ( loadingOverlay ) {
			var CategoryOverlay = M.require( 'mobile.categories.overlays/CategoryOverlay' );

			loadingOverlay.hide();
			result.resolve( new CategoryOverlay( {
				api: new mw.Api(),
				isAnon: user.isAnon(),
				title: M.getCurrentPage().title
			} ) );
		} );
		return result;
	} );

	// add categories overlay
	overlayManager.add( /^\/categories\/add$/, function () {
		var result = $.Deferred();

		loader.loadModule( 'mobile.categories.overlays' ).done( function ( loadingOverlay ) {
			var CategoryAddOverlay = M.require( 'mobile.categories.overlays/CategoryAddOverlay' );

			loadingOverlay.hide();
			result.resolve( new CategoryAddOverlay( {
				api: new mw.Api(),
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
		$( '.category-button' ).removeClass( 'hidden' );
	}

	$( initButton );

}( mw.mobileFrontend, jQuery ) );
