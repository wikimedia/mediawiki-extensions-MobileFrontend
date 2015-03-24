( function ( M, $ ) {
	M.require( 'context' ).assertMode( [ 'alpha', 'beta' ] );

	var MobileViewBannerImageRepository = M.require( 'modules/bannerImage/MobileViewBannerImageRepository' ),
		BannerImage = M.require( 'modules/bannerImage/BannerImage' ),
		page = M.getCurrentPage(),
		skin = M.require( 'skin' ),
		repository,
		bannerImage;

	// Load banner images on mobile devices for pages that are in mainspace but aren't Main_Page.
	if (
		!page.isMainPage() &&
		page.getNamespaceId() === 0
	) {
		repository = new MobileViewBannerImageRepository( new mw.Api(), page.title );
		bannerImage = new BannerImage( {
			repository: repository
		} );
		bannerImage.on( 'loaded', $.proxy( skin, 'emit', 'changed' ) );
		bannerImage.insertBefore( '.pre-content' );
	}
}( mw.mobileFrontend, jQuery ) );
