( function( M, $ ) {

( function() {
	var supported = !!navigator.geolocation,
		popup = M.require( 'notifications' ),
		cachedPages;

	function render( $content, pages ) {
		var $ul, $li;

		$content.empty();
		$ul = $( '<ul class="suggestions-results">' );
		pages.sort( function( a, b ) {
			return a.dist > b.dist ? 1 : -1;
		} ).forEach( function( page ) {
			$li = $( '<li class="suggestions-result">' ).
				appendTo( $ul );
			$( '<a>' ).attr( 'href', M.history.getArticleUrl( page.title ) ).
				attr( '_target', 'blank' ). // horrible hack for time being
				text( page.title ).appendTo( $li );
			$( '<p>' ).text( mw.message( 'mobile-frontend-nearby-distance-report',
				( page.dist / 1000 ).toFixed( 2 ) ) ).appendTo( $li );
		} );
		$ul.appendTo( $content );
	}

	function findResults( lat, lng ) {
		var $content = $( '#mw-mf-nearby' ), range = 10000;
		$.ajax( {
			dataType: 'json',
			url: M.getApiUrl(),
			data: {
				action: 'query',
				list: 'geosearch',
				format: 'json',
				gscoord: lat + '|' + lng,
				gsradius: range,
				gsnamespace: 0,
				gslimit: 100
			}
		} ).done( function( data ) {
			var pages = data.query.geosearch, $popup;
			if ( pages.length > 0 ) {
				if ( !cachedPages ) {
					render( $content, pages );
				} else {
					$popup = popup.show(
						mw.message( 'mobile-frontend-nearby-refresh' ).plain(), 'toast locked' );
					$popup.click( function() {
						render( $content, pages );
						popup.close( true );
					} );
				}

				cachedPages = pages;
			} else {
				$content.empty();
				$( '<div class="empty content">' ).
					text( mw.message( 'mobile-frontend-nearby-noresults' ).plain() ).
					appendTo( $content );
			}
		} ).error( function() {
			$( '#mw-mf-nearby' ).addClass( 'alert error content' ).text( mw.message( 'mobile-frontend-nearby-error' ) );
		} );
	}

	function init() {
		var $content = $( '#mw-mf-nearby' ).empty();
		$( '<div class="content loading"> ').text(
			mw.message( 'mobile-frontend-nearby-loading' ) ).appendTo( $content );
		navigator.geolocation.watchPosition( function( geo ) {
			var lat = geo.coords.latitude, lng = geo.coords.longitude;
			findResults( lat, lng );
		},
		function() {
			popup.show( mw.message( 'mobile-frontend-nearby-lookup-error' ).plain(), 'toast' );
		},
		{
			enableHighAccuracy: true
		} );
	}

	if ( supported ) {
		init();
	}
}() );


}( mw.mobileFrontend, jQuery ) );
