( function ( $, W ) {

var _ajax;
QUnit.module( 'MobileFrontend mf-watchlist.js', {
	setup: function() {
		_ajax = $.ajax;
		$.ajax = function( options ) {
			var d = new $.Deferred();
			if ( options.data.action === 'tokens' ) {
				d.resolve( { tokens: { watchtoken: ':D' } } );
			} else if ( options.data.inprop === 'watched' ) {
				if ( options.data.titles === 'Spongebob' ) {
					d.resolve( {
						query: {
							pages: {
								'1': { watched: '', title: 'Spongebob' } // presence of watched flag means article is watched
							}
						}
					} );
				} else if ( options.data.titles === 'Popeye|Spongebob' ) {
					d.resolve( {
						query: {
							pages: {
								'1': { watched: '', title: 'Spongebob' }, // presence of watched flag means article is watched
								'2': { title: 'Popeye' } // presence of watched flag means article is watched
							}
						}
					} );
				} else {
					d.resolve( { query: {
							pages: {
							'1': {}
							}
						} } );
				}
			}
			return d;
		};
	},
	teardown: function() {
		$.ajax = _ajax;
	}
} );

QUnit.test( 'init watched article', 2, function() {
	var $container = $( '<div>' );
	W.initWatchListIcon( $container[ 0 ], 'Spongebob' );
	strictEqual( $container.find( '.watch-this-article' ).length, 1, 'button created' );
	strictEqual( $container.find( '.watch-this-article' ).hasClass( 'watched' ), true, 'article is marked as watched' );
} );

QUnit.test( 'init unwatched article', 2, function() {
	var $container = $( '<div>' );
	W.initWatchListIcon( $container[ 0 ], 'Popeye' );
	strictEqual( $container.find( '.watch-this-article' ).length, 1, 'button created' );
	strictEqual( $container.find( '.watch-this-article' ).hasClass( 'watched' ), false, 'article is not marked as watched' );
} );

QUnit.test( 'initWatchListIconList', 2, function() {
	var $container = $( '<ul><li title="Popeye"><li title="Spongebob"></ul>' );
	W.initWatchListIconList( $container );
	strictEqual( $container.find( '.watch-this-article' ).length, 2, '2 buttons created' );
	strictEqual( $container.find( '.watch-this-article.watched' ).length, 1, 'One article is watched' );
} );

}( jQuery, mw.mobileFrontend.require( 'watchstar' ) ) );
