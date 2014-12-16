( function ( M ) {
	M.assertMode( [ 'alpha' ] );
	var bannerImage,
		page = M.getCurrentPage(),
		browser = M.require( 'browser' ),
		wikidataID = mw.config.get( 'wgWikibaseItemId' ),
		BannerImage = M.require( 'modules/bannerImage/BannerImage' );

	// Load banner images on mobile devices
	// On pages in the main space which are not main pages
	if (
		// MobileDevice
		!browser.isWideScreen() &&
		// Set item id or specified in url with query param (wikidataid=Q937)
		wikidataID &&
		!page.isMainPage() &&
		page.getNamespaceId() === 0
	) {
		bannerImage = new BannerImage( {
			itemId: wikidataID
		} );
		bannerImage.insertBefore( '#page-actions' );
	}
}( mw.mobileFrontend ) );
