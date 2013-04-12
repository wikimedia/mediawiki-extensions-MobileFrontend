( function( $ ) {
	function supportsTouchEvents() {
		return 'ontouchstart' in window;
	}

	function enhanceCheckboxes() {

		function clickChkBox() {
			var $parent = $( this ),
				box = $parent.children( 'input' )[ 0 ];

			if ( $parent.hasClass( 'checked' ) ) {
				$parent.removeClass( 'checked' );
				box.checked = false;
			} else {
				$parent.addClass( 'checked' );
				box.checked = true;
			}
		}

		$( '.mw-mf-checkbox-css3 > input[type=checkbox]' ).each( function( i, el ) {
			var $parent = $( el ).parent(),
				eventName = supportsTouchEvents() ? 'touchstart' : 'click';
			$parent.on( eventName, clickChkBox );
			if ( el.checked ) {
				$parent.addClass( 'checked ');
			}
		} );
	}

	$( enhanceCheckboxes );
}( jQuery ) );
