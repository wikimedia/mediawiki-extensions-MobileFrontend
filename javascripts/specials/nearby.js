( function( M, $ ) {
var icon,
	Icon = M.require( 'Icon' ),
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

	icon = new Icon( { name: 'refresh',
		id: 'secondary-button',
		additionalClassNames: 'main-header-button',
		tagName: 'a',
		title: mw.msg( 'mobile-frontend-nearby-refresh' ),
		label: mw.msg( 'mobile-frontend-nearby-refresh' )
	} );
	$( icon.toHtmlString() ).on( 'click', refresh ).
		appendTo( '.header' );

	refresh();
} );

}( mw.mobileFrontend, jQuery ) );
