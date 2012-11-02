/*global mw, document, window, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
(function( M, $ ) {

var w = ( function() {
	var lastToken;

	function toggleWatch( title, token, unwatchflag, callback, errback ) {
		var data = {
			format: 'json', action: 'watch',
			title: title, token: token
		}, msg = M.message( 'mobile-frontend-watchlist-add', M.setting( 'title' ) ),
			popupClass = 'watch-action';

		if( unwatchflag ) {
			data.unwatch = true;
			msg = M.message( 'mobile-frontend-watchlist-removed', M.setting( 'title' ) );
		} else {
			popupClass += ' watched';
		}

		function report() {
			M.navigation.popup.show( msg, popupClass );
		}

		$.ajax( {
			type: 'post', dataType: 'json',
			url:  M.getApiUrl(),
			data: data
		} ).done( callback ).fail( errback ).
			done( report );
	}

	function createWatchListButton( container, title, isWatchedArticle ) {
		var watchBtn, prevent;
		$( container ).find( '.watch-this-article' ).remove();

		watchBtn = $( '<a class="watch-this-article">' ).appendTo( container )[ 0 ];

		if( isWatchedArticle ) {
			$( watchBtn ).addClass( 'watched' );
		}

		function enable() {
			prevent = false;
			$( watchBtn ).removeClass( 'disabled' );
		}

		function success() {
			if( !$( watchBtn ).hasClass( 'watched' ) ) {
				$( watchBtn ).addClass( 'watched' );
			} else {
				$( watchBtn ).removeClass( 'watched' );
			}
			enable();
		}

		$( watchBtn ).click( function( ev ) {
			if( prevent ) {
				ev.preventDefault();
			}
			prevent = true;
			$( watchBtn ).addClass( 'disabled' );
			toggleWatch( title, lastToken, $( watchBtn ).hasClass( 'watched' ),
				success, enable );
		} );
	}

	function checkWatchStatus( title, callback ) {
		$.ajax( {
			url:  M.getApiUrl(), dataType: 'json',
			data: {
				action: 'query', titles: title, format: 'json',
				prop: 'info', inprop: 'watched'
			}
		} ).done( function( data ) {
				var pages = data.query.pages,
					status, i;
				for( i in pages ) {
					if( pages.hasOwnProperty( i ) ) {
						status = pages[ i ].hasOwnProperty( 'watched' );
					}
				}
				if( !pages['-1'] ) {
					callback( status );
				}
		} );
	}

	function initWatchList( container, title ) {
		M.getToken( 'watch', function( data ) {
			if( data.tokens && !data.warnings ) { // then user is logged in
				lastToken = data.tokens.watchtoken;
				checkWatchStatus( title, function( status ) {
					createWatchListButton( container, title, status );
				} );
			}
		} );
	}

	function upgradeSearch() {
		$( window ).bind( 'mw-mf-search-result', function( ev, container, title ) {
			initWatchList( container, title );
			} );
	}

	function init( container, title ) {
		var pageTitle = M.setting( 'title' );
		container = container || M.navigation.getPageMenu();
		title = title || pageTitle;
		$( window ).bind( 'mw-mf-page-loaded', function( ev, article ) {
			initWatchList( container, article.title );
		} );

		upgradeSearch();
	}

	return {
		init: init,
		initWatchList: initWatchList
	};
}());

M.registerModule( 'watchlist', w );

}( mw.mobileFrontend, jQuery ));
