( function ( M, $ ) {
	var MobileViewBannerImageRepository = M.require( 'mobile.bannerImage/MobileViewBannerImageRepository' ),
		BannerImage = M.require( 'mobile.bannerImage/BannerImage' ),
		page = M.getCurrentPage(),
		skin = M.require( 'mobile.startup/skin' ),
		repository,
		bannerImage;

	M.require( 'mobile.context/context' ).assertMode( [ 'beta' ] );

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
		bannerImage.insertBefore( '.pre-content:first' );
	}
}( mw.mobileFrontend, jQuery ) );
