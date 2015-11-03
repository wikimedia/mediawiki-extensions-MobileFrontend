( function ( M, $ ) {
	var category,
		JSONPForeignApi = M.require( 'mobile.foreignApi/JSONPForeignApi' ),
		loader = M.require( 'mobile.overlays/moduleLoader' ),
		Anchor = M.require( 'mobile.startup/Anchor' ),
		page = M.getCurrentPage(),
		overlayManager = M.require( 'mobile.startup/overlayManager' );

	overlayManager.add( /^\/commons-category\/(.+)$/, function ( title ) {
		var d = $.Deferred();

		loader.loadModule( 'mobile.commonsCategory' ).done( function () {
			var CommonsCategoryOverlay = M.require( 'mobile.commonsCategory/CommonsCategoryOverlay' );
			d.resolve(
				new CommonsCategoryOverlay( {
					api: new JSONPForeignApi( mw.config.get( 'wgMFPhotoUploadEndpoint' ) ),
					title: title
				} )
			);
		} );
		return d;
	} );

	category = mw.config.get( 'wgMFImagesCategory' );
	if ( category ) {
		new Anchor( {
			progressive: true,
			href: '#/commons-category/' + category,
			label: mw.msg( 'mobile-frontend-commons-category-view', page.title )
		} ).appendTo( '.pre-content' );
	}

}( mw.mobileFrontend, jQuery ) );
