( function( $ ) {
	$.matchMedia = function() {
		if ( window.matchMedia ) {
			$( 'style[data-media]' ).each( function() {
				var $el = $( this );
				if ( window.matchMedia( $el.data( 'media' ) ).matches ) {
					$( '<link rel="stylesheet">' ).
						attr( 'href', $el.data( 'href' ) ).
						insertAfter( $el );
				}
			} );
		}
	};
} ( jQuery ) );
