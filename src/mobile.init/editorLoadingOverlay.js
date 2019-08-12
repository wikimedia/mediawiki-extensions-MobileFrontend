var
	fakeToolbar = require( './fakeToolbar' ),
	Overlay = require( '../mobile.startup/Overlay' );

/**
 * Like loadingOverlay(), but with a fake editor toolbar instead of the spinner.
 *
 * @return {Overlay}
 */
function editorLoadingOverlay() {
	var
		$fakeToolbar = fakeToolbar(),
		overlay = new Overlay( {
			className: 'overlay overlay-loading',
			noHeader: true
		} );

	$fakeToolbar.appendTo( overlay.$el.find( '.overlay-content' ) );

	// Animate the toolbar sliding into place.
	$fakeToolbar.addClass( 'toolbar-hidden' );
	setTimeout( function () {
		$fakeToolbar.addClass( 'toolbar-shown' );
		setTimeout( function () {
			$fakeToolbar.addClass( 'toolbar-shown-done' );
		}, 250 );
	} );

	overlay.show = function () {
		Overlay.prototype.show.call( this );
		this.emit( 'show' );
	};

	return overlay;
}

module.exports = editorLoadingOverlay;
