( function ( M, $ ) {
	var category,
		loader = M.require( 'loader' ),
		Anchor = M.require( 'Anchor' ),
		page = M.getCurrentPage(),
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

	category = mw.config.get( 'wgMFImagesCategory' );
	if ( category ) {
		new Anchor( {
			progressive: true,
			href: '#/commons-category/' + category,
			label: mw.msg( 'mobile-frontend-commons-category-view', page.title )
		} ).appendTo( '.pre-content' );
	}

}( mw.mobileFrontend, jQuery ) );
