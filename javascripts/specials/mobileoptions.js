( function( M ) {

var m = ( function() {

	function enhanceCheckboxes() {

		var inputs = document.getElementsByTagName( 'input' ), i, el, special,
			u = M.utils;

		u( document.body ).addClass( 'mw-mf-checkboxes' );
		function clickChkBox() {
			var parent = this,
				box = parent.getElementsByTagName( 'input' )[ 0 ];

			if( !u( parent ).hasClass( 'checked' ) ) {
				u( parent ).addClass( 'checked' );
				box.checked = true;
			} else {
				u( parent ).removeClass( 'checked' );
				box.checked = false;
			}
		}

		for( i = 0; i < inputs.length; i++ ) {
			el = inputs[i];
			special = u( el.parentNode ).hasClass( 'mw-mf-checkbox-css3' );
			if( el.getAttribute( 'type' ) === 'checkbox' && special ) {
				u( el.parentNode ).bind( 'click', clickChkBox );
				if( el.checked ) {
					u( el.parentNode ).addClass( 'checked ');
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

M.registerModule( 'mobileoptions', m );

}( mw.mobileFrontend ) );
