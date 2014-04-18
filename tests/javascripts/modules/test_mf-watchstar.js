( function ( $, M ) {

var
	W = M.require( 'watchstar' ),
	api = M.require( 'api' );

QUnit.module( 'MobileFrontend mf-watchlist.js', {
	setup: function() {
		this.sandbox.stub( mw.user, 'isAnon' ).returns( false );
		this.sandbox.stub( api, 'getToken' ).returns( $.Deferred().resolve( ':D' ) );
	}
} );

QUnit.test( 'init watched article', 2, function() {
	var $container = $( '<div>' );
	this.sandbox.stub( api, 'ajax' ).returns( $.Deferred().resolve( {
		query: {
			pages: {
				'1': { watched: '', title: 'Spongebob' } // presence of watched flag means article is watched
			}
		}
	} ) );
	W.initWatchListIcon( $container[ 0 ], 'Spongebob' );
	strictEqual( $container.find( '.watch-this-article' ).length, 1, 'button created' );
	strictEqual( $container.find( '.watch-this-article' ).hasClass( 'watched' ), true, 'article is marked as watched' );
} );

QUnit.test( 'init unwatched article', 2, function() {
	var $container = $( '<div>' );
	this.sandbox.stub( api, 'ajax' ).returns( $.Deferred().resolve( {
		query: {
			pages: {
				'1': {}
			}
		}
	} ) );
	W.initWatchListIcon( $container[ 0 ], 'Popeye' );
	strictEqual( $container.find( '.watch-this-article' ).length, 1, 'button created' );
	strictEqual( $container.find( '.watch-this-article' ).hasClass( 'watched' ), false, 'article is not marked as watched' );
} );

QUnit.test( 'initWatchListIconList', 2, function() {
	var $container = $( '<ul><li title="Popeye"><li title="Spongebob"></ul>' );
	this.sandbox.stub( api, 'ajax' ).returns( $.Deferred().resolve( {
		query: {
			pages: {
				'1': { watched: '', title: 'Spongebob' }, // presence of watched flag means article is watched
				'2': { title: 'Popeye' } // presence of watched flag means article is watched
			}
		}
	} ) );
	W.initWatchListIconList( $container );
	strictEqual( $container.find( '.watch-this-article' ).length, 2, '2 buttons created' );
	strictEqual( $container.find( '.watch-this-article.watched' ).length, 1, 'One article is watched' );
} );

}( jQuery, mw.mobileFrontend ) );
