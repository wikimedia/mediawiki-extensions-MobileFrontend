const icons = require( '../mobile.startup/icons' );

/* global $ */
module.exports = function fakeToolbar() {
	var $fakeToolbar, $goBack, $loadingMessage;

	$goBack = icons.cancel( null, {
		tagName: 'a'
	} ).$el.attr( 'tabindex', '0' )
		.attr( 'role', 'button' );

	$loadingMessage = icons.spinner( {
		tagName: 'span',
		hasText: true,
		additionalClassNames: '',
		label: mw.msg( 'mobile-frontend-editor-loading' )
	} ).$el;

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
