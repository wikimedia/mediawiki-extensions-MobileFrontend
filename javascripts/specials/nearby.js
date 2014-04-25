// FIXME: Refactor to use modules/nearby/Nearby
( function( M, $ ) {
var CACHE_KEY_RESULTS = 'mfNearbyLastSearchResult',
	overlay,
	Nearby = M.require( 'modules/nearby/Nearby' );

$( function() {
	var
		$userBtn = $( '#secondary-button' ),
		cache = M.settings.saveUserSetting,
		lastSearchResult = M.settings.getUserSetting( CACHE_KEY_RESULTS ),
		// FIXME: Adapt modules/nearby/Nearby.js and use that instead
		pendingQuery = false, $btn;

	overlay = new Nearby( {
		el: $( '#mw-mf-nearby' )
	} ).on( 'end-load-from-current-location', function() {
		$btn.removeClass( 'loading' );
		pendingQuery = false;
	} ).on( 'searchResult', function( pages ) {
		cache( CACHE_KEY_RESULTS, $.toJSON( pages ) );
	} );

	function refresh() {
		if ( pendingQuery ) {
			return;
		} else {
			$btn.addClass( 'loading' );
			pendingQuery = true;
			overlay.loadFromCurrentLocation();
		}
	}

	// render from cache or render from current location
	if ( lastSearchResult && window.location.hash ) {
		overlay.render( { pages: $.parseJSON( lastSearchResult ) } );
	} else {
		overlay.loadFromCurrentLocation();
	}

	// replace user button with refresh button
	if ( $userBtn.length ) {
		$userBtn.remove();
	}
	// FIXME: i18n
	$btn = $( '<a class="icon-refresh main-header-button icon" id="secondary-button">' ).
		on( 'click', refresh ).appendTo( '.header' );
} );

}( mw.mobileFrontend, jQuery ) );
