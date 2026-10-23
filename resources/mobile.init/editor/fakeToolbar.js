const { cancelIcon, spinner } = require( 'mobile.startup' );

/* global $ */

/**
 * Build the spinner + label shown while the editor is loading.
 *
 * The label is a single "Loading editor…" phrase by default. Other code (e.g.
 * VisualEditor/EditCheck) can append further `.ve-mobile-fakeToolbar-loading-label-text`
 * spans to `.ve-mobile-fakeToolbar-loading-label` in response to the
 * `mobileFrontend.fakeToolbar.ready` hook; any styling needed to stack/animate between
 * multiple phrases is that code's own responsibility.
 *
 * @ignore
 * @return {jQuery}
 */
function getLoadingMessage() {
	const $spinner = spinner( {
		tagName: 'span',
		isIconOnly: true
	} ).$el;
	$spinner.attr( 'aria-hidden', 'true' );

	const $label = $( '<span>' )
		.addClass( 've-mobile-fakeToolbar-loading-label' )
		.append(
			$( '<span>' )
				.addClass( 've-mobile-fakeToolbar-loading-label-text' )
				.text( mw.msg( 'mobile-frontend-editor-loading' ) )
		);

	return $( '<span>' )
		.addClass( 've-mobile-fakeToolbar-loading' )
		.append( $spinner, $label );
}

module.exports = function fakeToolbar( options = {} ) {
	const $goBack = cancelIcon().$el;
	const $loadingMessage = getLoadingMessage();

	// Wrappers similar to .overlay-header-container, .overlay-header and .oo-ui-toolbar
	const $fakeToolbar = $( '<div>' )
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

	// Inform other interested code (e.g. VisualEditor/EditCheck) that the loading
	// toolbar is in the DOM and ready to be added to.
	/**
	 * @event ~'mobileFrontend.fakeToolbar.ready'
	 * @memberof Hooks
	 * @param {Object} data
	 * @param {jQuery} data.$fakeToolbar The fake toolbar element
	 * @param {jQuery} data.$loadingMessage The spinner + label element
	 * @param {jQuery} data.$goBack The go-back/cancel button element
	 * @param {boolean} [data.isSourceMode] Whether the source editor is being loaded
	 */
	mw.hook( 'mobileFrontend.fakeToolbar.ready' ).fire( {
		$fakeToolbar,
		$loadingMessage,
		$goBack,
		isSourceMode: options.isSourceMode
	} );

	return $fakeToolbar;
};
