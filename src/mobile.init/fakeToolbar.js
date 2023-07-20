const icons = require( '../mobile.startup/icons' );

/* global $ */
module.exports = function fakeToolbar() {
	var $fakeToolbar, $goBack, $loadingMessage;

	$goBack = icons.cancel().$el;

	// FIXME: Should not be a button, instead should be an icon with text
	$loadingMessage = icons.spinner( {
		tagName: 'span',
		isIconOnly: false,
		label: mw.msg( 'mobile-frontend-editor-loading' )
	} ).$el;

	// Wrappers similar to .overlay-header-container, .overlay-header and .oo-ui-toolbar
	$fakeToolbar = $( '<div>' )
		.addClass( 've-mobile-fakeToolbar-container' )
		.append( $( '<div>' )
			.addClass( 've-mobile-fakeToolbar-header' )
			// Minerva has some complicated styling for this class, so we have to include it
			.addClass( 'overlay-header' )
			.append( $( '<div>' )
				.addClass( 've-mobile-fakeToolbar' )
				.append( $goBack, $loadingMessage )
			)
		);

	return $fakeToolbar;
};
