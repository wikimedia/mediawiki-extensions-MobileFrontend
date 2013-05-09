( function( M, $ ) {
	var api = M.require( 'api' ),
		cache = {};

	function retrievePage( pageTitle, endpoint ) {
		var cachedPage = cache[ pageTitle ],
			options = endpoint ? { url: endpoint, dataType: 'jsonp' } : {};

		if ( !cachedPage ) {
			cachedPage = $.Deferred().fail( function() {
				delete cache[ pageTitle ];
			} );
			api.get( {
				action: 'mobileview',
				page: pageTitle,
				variant: mw.config.get( 'wgPreferredVariant' ),
				redirects: 'yes', prop: 'sections|text', noheadings: 'yes',
				noimages: mw.config.get( 'wgImagesDisabled', false ) ? 1 : undefined,
				sectionprop: 'level|line|anchor', sections: 'all'
			}, options ).then( function( r ) {
				if ( r.error || !r.mobileview.sections ) {
					cachedPage.reject( r );
				} else {
					cachedPage.resolve( {
						title: pageTitle,
						sections: r.mobileview.sections,
						mainpage: r.mobileview.hasOwnProperty( 'mainpage' ) ? true : false
					} );
				}
			} ).fail( function( r ) {
				cachedPage.reject( r );
			} );
			cache[ pageTitle ] = cachedPage;
		}
		return cachedPage;
	}

	M.history.retrievePage = retrievePage;

	M.on( 'section-rendered', function( $content ) {
		// FIXME: this should live in the hidpi module when dynamic sections is promoted from beta
		if ( $content.hidpi ) {
			$content.hidpi();
		}
	} );

} ( mw.mobileFrontend, jQuery ) );
