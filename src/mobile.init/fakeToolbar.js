/* global $ */
module.exports = function fakeToolbar() {
	var $fakeToolbar, $goBack, $loadingMessage;

	$goBack = $( '<a>' )
		.attr( 'tabindex', '0' )
		.attr( 'role', 'button' )
		.addClass( 'mw-ui-icon mw-ui-icon-close mw-ui-icon-element' )
		// This class makes it a functional close button for the overlay
		.addClass( 'cancel' )
		.text( mw.msg( 'mobile-frontend-overlay-close' ) );

	$loadingMessage = $( '<span>' )
		.addClass( 'mw-ui-icon mw-ui-icon-mf-spinner mw-ui-icon-before' )
		.text( mw.msg( 'mobile-frontend-editor-loading' ) );

	// Wrappers similar to .overlay-header-container, .overlay-header and .oo-ui-toolbar
	$fakeToolbar = $( '<div>' )
		.addClass( 've-mobile-fakeToolbar-container' )
		.append( $( '<div>' )
			.addClass( 've-mobile-fakeToolbar-header' )
			// Minerva has some complicated styling for this class, so we have to include it
			.addClass( 'header' )
			.append( $( '<div>' )
				.addClass( 've-mobile-fakeToolbar' )
				.append( $goBack, $loadingMessage )
			)
		);

	return $fakeToolbar;
};
