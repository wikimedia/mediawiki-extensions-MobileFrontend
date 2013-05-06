( function( M, $ ) {
	var api = M.require( 'api' ),
		cache = {};

	function retrievePage( pageTitle, endpoint ) {
		var cachedPage = cache[ pageTitle ],
			options = endpoint ? { url: endpoint, dataType: 'jsonp' } : {};

		if ( !cachedPage ) {
			cachedPage = $.Deferred();
			api.get( {
				action: 'mobileview',
				page: pageTitle,
				variant: mw.config.get( 'wgPreferredVariant' ),
				redirects: 'yes', prop: 'sections|text', noheadings: 'yes',
				noimages: mw.config.get( 'wgImagesDisabled', false ) ? 1 : undefined,
				sectionprop: 'level|line|anchor', sections: 'all'
			}, options ).then( function( r ) {
				if ( r.mobileview.sections ) {
					cachedPage.resolve( {
						heading: pageTitle,
						sections: r.mobileview.sections,
						mainpage: r.mobileview.hasOwnProperty( 'mainpage' ) ? true : false
					} );
				} else {
					cachedPage.reject( r );
				}
			} ).fail( function( r ) {
				cachedPage.reject( r );
			} );
			cache[ pageTitle ] = cachedPage;
		}
		return cachedPage;
	}

	M.history.retrievePage = retrievePage;

} ( mw.mobileFrontend, jQuery ) );
