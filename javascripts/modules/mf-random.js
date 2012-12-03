( function( M,  $ ) {
var m = ( function() {
	var randomPageReq;

	function makeHeader( articles ) {
		var $list, $c;
		$c = $( '<div class="mw-mf-confirm-random">' ).insertAfter( 'h1' );
		$( '<p>' ).text( M.message( 'mobile-frontend-ajax-random-question' ) ).appendTo( $c );
		$( '<button>' ).text( M.message( 'mobile-frontend-ajax-random-retry' ) ).click( getRandomArticle ).appendTo( $c );
		$( '<button>' ).text( M.message( 'mobile-frontend-ajax-random-yes' ) ).click( function() {
			$c.remove();
		} ).appendTo( $c );

		$list = $( '<ul class="hlist">' ).appendTo( $c );
		$( '<li>' ).text( M.message( 'mobile-frontend-ajax-random-suggestions' ) ).appendTo( $list );

		function openSuggestion( ev ) {
			ev.preventDefault();
			M.history.loadPage( $( this ).text(), true );
			makeHeader( articles );
		}

		articles.forEach( function( article ) {
			var li = $( '<li>' ).appendTo( $list );
			$( '<a>' ).attr( 'href', M.history.getArticleUrl( article.title ) ).
				text( article.title ).appendTo( li ).
				click( openSuggestion );
		} );
	}

	function getRandomArticle() {
		var curPage, $el;

		$el = M.history.makeStubPage( M.message( 'mobile-frontend-ajax-random-heading' ), '' ).find( '.content_block' );
		$( '<blockquote>' ).text( M.message( 'mobile-frontend-ajax-random-quote' ) ).appendTo( $el );
		$( '<p class="author">' ).text( M.message( 'mobile-frontend-ajax-random-quote-author' ) ).appendTo( $el );

		randomPageReq = $.ajax( {
			url: M.getApiUrl(),
			dataType: 'json',
			data: { action: 'query', list: 'random', rnnamespace: 0, rnlimit: 10, format: 'json' }
		} ).done( function( data ) {
			if ( !data.error && data.query && data.query.random ) {
				curPage = data.query.random[ 0 ];
				M.history.navigateToPage( curPage.title, true );
				mwMobileFrontendConfig.settings.title = curPage.title;
				makeHeader( data.query.random.slice( 1 ) );
				$el.removeClass( 'loading' );
			}
		} );
	}

	function init() {
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
	};
}() );

M.registerModule( 'random-dynamic', m );

} )( mw.mobileFrontend, jQuery );
