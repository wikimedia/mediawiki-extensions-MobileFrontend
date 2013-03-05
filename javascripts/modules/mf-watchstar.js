(function( M, $ ) {

var api = M.require( 'api' ), w = ( function() {
	var lastToken, nav = M.require( 'navigation' ), popup = M.require( 'notifications' );

	// FIXME: this should live in a separate module and make use of MobileFrontend events
	function logWatchEvent( eventType ) {
		var types = [ 'watchlist', 'unwatchlist', 'anonCTA' ],
			data = {
				// FIXME: this gives wrong results when page loaded dynamically
				articleID: mw.config.get( 'wgArticleId' ),
				anon: mw.config.get( 'wgUserName' ) === null,
				action: types[ eventType ],
				isStable: mw.config.get( 'wgMFMode' ),
				token: lastToken || '+\\', // +\\ for anon
				username: mw.config.get( 'wgUserName' ) || ''
			};

		M.log( 'MobileBetaWatchlist', data );
	}

	function toggleWatch( title, token, unwatchflag, callback, errback ) {
		var data = {
			format: 'json', action: 'watch',
			title: title, token: token
		},
			msg = M.message( 'mobile-frontend-watchlist-add', title ),
			popupClass = 'watch-action toast';

		if( unwatchflag ) {
			data.unwatch = true;
			msg = M.message( 'mobile-frontend-watchlist-removed', title );
		} else {
			popupClass += ' watched';
		}

		function report() {
			popup.show( msg, popupClass );
		}

		$.ajax( {
			type: 'post', dataType: 'json',
			url:  M.getApiUrl(),
			data: data
		} ).done( callback ).fail( errback ).
			done( report );
	}

	function createButton( container ) {
		$( container ).find( '.watch-this-article' ).remove();
		return $( '<a class="watch-this-article">' ).appendTo( container )[ 0 ];
	}

	function createWatchListButton( container, title, isWatchedArticle ) {
		var prevent,
			watchBtn = createButton( container );

		if( isWatchedArticle ) {
			$( watchBtn ).addClass( 'watched' );
		}

		function enable() {
			prevent = false;
			$( watchBtn ).removeClass( 'disabled loading' );
		}

		function success( data ) {
			if ( data.watch.hasOwnProperty( 'watched' ) ) {
				logWatchEvent( 0 );
				$( watchBtn ).addClass( 'watched' );
			} else {
				logWatchEvent( 1 );
				$( watchBtn ).removeClass( 'watched' );
			}
			enable();
		}

		function toggleWatchStatus( unwatch ) {
			api.getToken( 'watch' ).done( function( token ) {
				toggleWatch( title, token, unwatch, success, enable );
			} );
		}

		$( watchBtn ).click( function( ev ) {
			if( prevent ) {
				ev.preventDefault();
			}
			prevent = true;
			$( watchBtn ).addClass( 'disabled loading' );
			toggleWatchStatus( $( watchBtn ).hasClass( 'watched' ) );
		} );

	}

	/**
	 * Checks whether a list of article titles are being watched by the current user via ajax request to server
	 *
	 * @param {Array} titles: A list of titles to check the watchlist status of
	 * @param {Function} callback: A callback that is passed a json of mappings from title to booleans describing whether page is watched
	 */
	function asyncCheckWatchStatus( titles, callback ) {
		$.ajax( {
			url:  M.getApiUrl(), dataType: 'json',
			data: {
				action: 'query', format: 'json',
				titles: titles.join( '|' ),
				prop: 'info', inprop: 'watched'
			}
		} ).done( function( data ) {
				var pages = data.query.pages,
					notEmpty = !pages[ '-1' ], statuses = {}, page, i;
				for( i in pages ) {
					if( pages.hasOwnProperty( i ) ) {
						page = pages[ i ];
						statuses[ page.title ] = page.hasOwnProperty( 'watched' );
					}
				}
				if( notEmpty ) {
					callback( statuses );
				}
		} );
	}

	/**
	 * Checks whether a list of article titles are being watched by the current user
	 * Checks a local cache before making a query to server
	 *
	 * @param {Array} titles: A list of titles to check the watchlist status of
	 * @param {Function} callback: A callback that is passed a json of mappings from title to booleans describing whether page is watched
	 */
	function checkWatchStatus( titles, callback ) {
		var cache = mw.config.get( 'wgWatchedPageCache' ) || {};
		// check local cache in case where only one title is passed
		// FIXME: allow this to work for more than one title
		if ( titles.length === 1 && typeof cache[ titles[ 0 ] ] !== 'undefined' ) {
			callback( cache );
		} else {
			asyncCheckWatchStatus( titles, callback );
		}
	}

	function initWatchListIcon( container, title ) {
		var drawer = new nav.CtaDrawer( { content: mw.msg( 'mobile-frontend-watchlist-cta' ) } );

		api.getToken( 'watch' ).done( function( token ) {
			lastToken = token;
			checkWatchStatus( [ title ], function( status ) {
				createWatchListButton( container, title, status[ title ] );
			} );
		} ).fail( function() {
			$( createButton( container ) ).click( function( ev ) {
				if ( !drawer.isVisible() ) {
					// log if enabled
					logWatchEvent( 2 );
					drawer.show();
				} else {
					drawer.hide();
				}
				ev.stopPropagation();
			} );
		} );
	}

	/**
	 * Init a list of watch list icons where each li element has a title
	 * attribute pointing to the name of the article
	 *
	 * @param {jQuery object} %container: An element wrapped in jQuery
	 * @param {boolean} allPagesAreWatched: When set avoids
	 *   ajax lookup and assumes all title's are currently watched
	 */
	// FIXME: avoid if statement repetition with initWatchListIcon
	function initWatchListIconList( $container, allPagesAreWatched ) {
		var $items = $container.find( 'li' ), titles = [];
		$items.each( function() {
			titles.push( $( this ).attr( 'title' ) );
		} );

		if ( allPagesAreWatched ) {
			$container.find( 'li' ).each( function() {
				var title = $( this ).attr( 'title' );
				createWatchListButton( this, title, true );
			} );
		} else {
			api.getToken( 'watch' ).done( function( token ) {
				lastToken = token;

				checkWatchStatus( titles, function( status ) {
					$container.find( 'li' ).each( function() {
						var title = $( this ).attr( 'title' );
						createWatchListButton( this, title, status[ title ] );
					} );
				} );
			} );
		}
	}

	function upgradeUI() {
		M.on( 'search-results', function( $ul ) {
			initWatchListIconList( $ul );
		} );
	}

	function init( container, title ) {
		var pageTitle = mw.config.get( 'wgTitle' );
		container = container || nav.getPageMenu();
		title = title || pageTitle;
		// initialise on current page
		if ( container ) {
			initWatchListIcon( container, title );
		}

		// bind to future page loads
		M.on( 'page-loaded', function( article ) {
			initWatchListIcon( container, article.title );
		} );

		upgradeUI();
	}

	return {
		init: init,
		initWatchListIcon: initWatchListIcon,
		initWatchListIconList: initWatchListIconList
	};
}());

M.define( 'watchstar', w );

}( mw.mobileFrontend, jQuery ));
