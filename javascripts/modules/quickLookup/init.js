( function ( M, $ ) {
	M.require( 'context' ).assertMode( [ 'alpha' ] );

	var api = M.require( 'api' ),
		toast = M.require( 'toast' ),
		Swipe = M.require( 'Swipe' ),
		swipe,
		QuickLookupDrawer = M.require( 'modules/quickLookup/QuickLookupDrawer' ),
		hostname = window.location.hostname,
		cache = {},
		drawer;

	/**
	 * Search API for a brief intro about a page.
	 * @param {String} title title of the page
	 */
	function lookup( title ) {
		var deferred = $.Deferred(),
			promise = deferred.promise();

		if ( cache.hasOwnProperty( title ) ) {
			if ( cache[title] ) {
				deferred.resolve( cache[title] );
			} else {
				deferred.reject();
			}
		} else {
			api.get( {
				prop: 'extracts',
				exsentences: 5,
				titles: title,
				exintro: '',
				continue: '',
				explaintext: ''
			} ).then( function ( data ) {
				var pages = OO.getProp( data, 'query', 'pages' ),
					pageID,
					extract;

				cache[title] = null;  // just to mark that we searched the API
				if ( pages ) {
					for ( pageID in pages ) {
						if ( pages.hasOwnProperty( pageID ) ) {
							extract = OO.getProp( pages, pageID, 'extract' );
							if ( extract ) {
								cache[title] = {
									title: title,
									text: extract,
									id: pageID
								};
								deferred.resolve( cache[title] );
								break;
							}
						}
					}
				}
				if ( cache[title] === null ) {
					deferred.reject();
				}
			} ).fail( deferred.reject );
		}

		return promise;
	}

	/**
	 * Show a QuickLookupDrawer with information about {link}
	 * Link must have the same hostname as the site, i.e. it must be an internal link.
	 * Show a toast before searching and a drawer with page info after the search is successful.
	 * @param {jQuery.Event} ev Event object of the swipe gesture
	 */
	function showDrawer( ev ) {
		var link = ev.currentTarget,
			linkTitle = link.title,
			linkHostname = link.hostname;

		toast.hide();
		if ( drawer ) {
			drawer.hide();
		}

		if ( linkHostname === hostname && linkTitle ) {
			toast.show( mw.msg( 'mobile-frontend-quick-lookup-looking', linkTitle ), 'toast quick-lookup' );
			lookup( linkTitle ).done( function ( page ) {
				toast.hide();
				drawer = new QuickLookupDrawer( page );
				drawer.show();
			} ).fail( function () {
				toast.show(
					mw.msg( 'mobile-frontend-quick-lookup-no-results', linkTitle ),
					'toast quick-lookup'
				);
			} );
		} else {
			toast.show(
				mw.msg( 'mobile-frontend-quick-lookup-not-internal', mw.config.get( 'wgSiteName' ) ),
				'toast quick-lookup'
			);
		}
	}

	$( function () {
		// initialize swipe module
		swipe = new Swipe();
		// listen on our wanted swipe directions
		swipe
			.on( 'swipe-right', $.proxy( showDrawer ) )
			.on( 'swipe-left', $.proxy( showDrawer ) );
		// listen on all links
		swipe.setElement( $( 'a' ) );
	} );
}( mw.mobileFrontend, jQuery ) );
