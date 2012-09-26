/*global mw, document, window, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
(function( M, $ ) {

var w = ( function() {
	var lastToken;

	function toggleWatch( title, token, unwatchflag, callback, errback ) {
		var data = {
			format: 'json', action: 'watch',
			title: title, token: token
		};

		if( unwatchflag ) {
			data.unwatch = true;
		}

		$.ajax( {
			type: 'post', dataType: 'json',
			url:  M.getApiUrl(),
			data: data
		} ).done( callback ).fail( errback );
	}

	function createWatchListButton( container, title, isWatchedArticle ) {
		var watchBtn, prevent;

		watchBtn = $( '<a class="watch-this-article">' ).appendTo( container );
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
		if ( $( '#mainpage' ).length === 0 ) { // FIXME: enable watching of main page
			container = container || $( '#mw-mf-sq' )[ 0 ];
			title = title || pageTitle;
			initWatchList( container, title );
		}
		upgradeSearch();
	}

	return {
		init: init,
		initWatchList: initWatchList
	};
}());

M.registerModule( 'watchlist', w );

}( mw.mobileFrontend, jQuery ));
