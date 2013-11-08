( function( M, $ ) {

	function setCount( $source, $counterElement ) {
		var chars = $source.value.length,
			limit = mw.config.get( 'wgMFMaxDescriptionChars' );
		if ( chars > limit ) {
			$source.value = $source.value.substr( 0, limit );
			chars = limit;
		}
		$counterElement.text( limit - chars );
		if ( limit - chars < 10 ) {
			$counterElement.css( 'color', '#CC0000' );
		} else {
			// Keep this color in sync with @grayMid in the LESS file
			$counterElement.css( 'color', '#A6A6A6' );
		}
	}

	function editUserDescription() {
		$( '.edit-button' ).hide();
		$( '.user-description' ).hide();
		$( '#user-description-form' ).show();
	}

	function initialize() {
		var $editButton = $( '<div>' ).
			addClass( 'edit-button' ).
			text( mw.message( 'mobile-frontend-editor-edit' ) ).
			on( 'click', function( ev ) {
				ev.preventDefault();
				editUserDescription();
			} );
		if ( $( '#user-description-form' ).length ) {
			$( '.user-description-container' ).append( $editButton );
			$( '.user-description-editor' ).on( 'keyup focus', function() {
				setCount( this, $( '.character-counter' ) );
			} );
		}
	}

	// Once the DOM is loaded, initialize the edit button
	$( function() {
		initialize();
	} );

}( mw.mobileFrontend, jQuery ) );
