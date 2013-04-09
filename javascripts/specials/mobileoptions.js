( function( M, $ ) {

var m = ( function() {

	function enhanceCheckboxes() {

		var inputs = document.getElementsByTagName( 'input' ), i, el, special;

		$( 'body' ).addClass( 'mw-mf-checkboxes' );
		function clickChkBox() {
			var parent = this,
				box = parent.getElementsByTagName( 'input' )[ 0 ];

			if( !$( parent ).hasClass( 'checked' ) ) {
				$( parent ).addClass( 'checked' );
				box.checked = true;
			} else {
				$( parent ).removeClass( 'checked' );
				box.checked = false;
			}
		}

		for( i = 0; i < inputs.length; i++ ) {
			el = inputs[i];
			special = $( el.parentNode ).hasClass( 'mw-mf-checkbox-css3' );
			if( el.getAttribute( 'type' ) === 'checkbox' && special ) {
				$( el.parentNode ).on( 'click', clickChkBox );
				if( el.checked ) {
					$( el.parentNode ).addClass( 'checked ');
				}
			}
		}
	}

	function init() {
		enhanceCheckboxes();
	}

	return {
		init: init
	};
}() );

M.define( 'mobileoptions', m );

}( mw.mobileFrontend, jQuery ) );
