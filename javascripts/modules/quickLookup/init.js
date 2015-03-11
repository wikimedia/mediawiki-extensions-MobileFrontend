( function ( M, $ ) {
	M.require( 'context' ).assertMode( [ 'alpha' ] );

	var api = M.require( 'api' ),
		toast = M.require( 'toast' ),
		QuickLookupDrawer = M.require( 'modules/quickLookup/QuickLookupDrawer' ),
		hostname = window.location.hostname,
		cache = {},
		drawer,
		startTouch,
		endTouch;

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
	 * @param {DOM.Object} link DOM element in which we are interested
	 */
	function showDrawer( link ) {
		var title = $( link ).text();

		toast.hide();
		if ( drawer ) {
			drawer.hide();
		}

		if ( link.hostname === hostname ) {
			toast.show( 'Looking for <b>' + title + '</b>...', 'toast quick-lookup' );
			lookup( title ).done( function ( page ) {
				toast.hide();
				drawer = new QuickLookupDrawer( page );
				drawer.show();
			} ).fail( function () {
				toast.show( 'Couldn\'t find anything matching <b>' + title + '</b>.', 'toast quick-lookup' );
			} );
		} else {
			toast.show( 'Sorry, only internal links are searchable.', 'toast quick-lookup' );
		}
	}

	$( function () {
		// Detect if the user is making a long horizontal swipe (which starts at the link) over a link
		$( 'a' ).on( 'touchstart', function ( ev ) {
			startTouch = ev.originalEvent.changedTouches[0];
		} ).on( 'touchend', function ( ev ) {
			endTouch = ev.originalEvent.changedTouches[0];
			// we want a long horizontal swipe
			if ( Math.abs( startTouch.pageX - endTouch.pageX ) > 200 ) {
				showDrawer( ev.currentTarget );
			}
		} );
	} );
}( mw.mobileFrontend, jQuery ) );
