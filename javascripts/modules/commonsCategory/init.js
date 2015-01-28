( function ( M, $ ) {
	var loader = M.require( 'loader' ),
		overlayManager = M.require( 'overlayManager' );

	overlayManager.add( /^\/commons-category\/(.+)$/, function ( title ) {
		var d = $.Deferred();

		loader.loadModule( 'mobile.commonsCategory' ).done( function () {
			var CommonsCategoryOverlay = M.require( 'modules/commonsCategory/CommonsCategoryOverlay' );
			d.resolve(
				new CommonsCategoryOverlay( {
					title: title
				} )
			);
		} );
		return d;
	} );

}( mw.mobileFrontend, jQuery ) );
