( function( M, $ ) {
var
	Nearby = M.require( 'modules/nearby/Nearby' );

$( function() {
	var
		nearby,
		options = { el: $( '#mw-mf-nearby' ), useCurrentLocation: true },
		$btn = $( '#secondary-button' );

	function refresh() {
		if ( nearby ) {
			nearby.initialize( options );
		} else {
			nearby = new Nearby( options );
		}
	}

	// replace user button with refresh button
	if ( $btn.length ) {
		$btn.remove();
	}
	// FIXME: i18n
	$btn = $( '<a class="icon-refresh main-header-button icon" id="secondary-button">' ).
		on( 'click', refresh ).appendTo( '.header' );
	refresh();
} );

}( mw.mobileFrontend, jQuery ) );
