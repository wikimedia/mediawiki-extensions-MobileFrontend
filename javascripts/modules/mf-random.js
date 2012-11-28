( function( M,  $ ) {
var m = ( function() {
	var randomPageReq;

	function getRandomArticle() {
		var curPage;

		function makeButtons() {
			var $c = $( '<div class="mw-mf-confirm-random">' ).insertAfter( 'h1' );
			$( '<p>' ).text( M.message( 'mobile-frontend-ajax-random-question' ) ).appendTo( $c );
			$( '<button>' ).text( M.message( 'mobile-frontend-ajax-random-retry' ) ).click( getRandomArticle ).appendTo( $c );
			$( '<button>' ).text( M.message( 'mobile-frontend-ajax-random-yes' ) ).click( function() {
				randomPageReq = M.history.navigateToPage( curPage.title );
				randomPageReq.done( function() {
					randomPageReq = false;
				} );
				$c.remove();
			} ).appendTo( $c );
		}

		$el = M.history.makeStubPage( M.message( 'mobile-frontend-ajax-random-heading' ), '' ).find( '.content_block' );
		$( '<blockquote>' ).text( M.message( 'mobile-frontend-ajax-random-quote' ) ).appendTo( $el );
		$( '<p class="author">' ).text( M.message( 'mobile-frontend-ajax-random-quote-author' ) ).appendTo( $el );

		randomPageReq = $.ajax( {
			url: M.getApiUrl(),
			dataType: 'json',
			data: { action: 'query', list: 'random', rnnamespace: 0, rnlimit: 1, format: 'json' }
		} ).done( function( data ) {
			if ( !data.error && data.query && data.query.random ) {
				curPage = data.query.random[ 0 ];
				$( 'h1' ).text( curPage.title );
				mwMobileFrontendConfig.settings.title = curPage.title;
				makeButtons();
				$el.removeClass( 'loading' );
			}
		} );
	}

	function init() {
		var $el, $quote, $author;

		// prevent the random button closing the navigation menu and make it work via ajax
		$( '#randomButton' ).unbind( 'click' ).click( function( ev ) {
			if ( $( window ).width() < 700 ) {
				$( 'html' ).removeClass( 'navigationEnabled' );
			}
			ev.preventDefault();
			getRandomArticle();
		} );
	}

	return {
		init: init
	}
}() );

M.registerModule( 'random-dynamic', m );

} )( mw.mobileFrontend, jQuery );
