var
	fakeToolbar = require( './fakeToolbar' ),
	Overlay = require( '../mobile.startup/Overlay' );

/**
 * Like loadingOverlay(), but with a fake editor toolbar instead of the spinner.
 *
 * @param {Function} afterShow Callback which runs after overlay is shown
 * @param {Function} afterHide Callback which runs after overlay is hidden
 * @return {Overlay}
 */
function editorLoadingOverlay( afterShow, afterHide ) {
	var
		$fakeToolbar = fakeToolbar(),
		overlay = new Overlay( {
			className: 'overlay overlay-loading',
			noHeader: true,
			isBorderBox: false,
			onBeforeExit: function ( exit ) {
				exit();
				afterHide();
			}
		} );

	overlay.show = function () {
		Overlay.prototype.show.call( this );
		afterShow();
	};

	$fakeToolbar.appendTo( overlay.$el.find( '.overlay-content' ) );

	// Animate the toolbar sliding into place.
	$fakeToolbar.addClass( 'toolbar-hidden' );
	setTimeout( function () {
		$fakeToolbar.addClass( 'toolbar-shown' );
		setTimeout( function () {
			$fakeToolbar.addClass( 'toolbar-shown-done' );
		}, 250 );
	} );

	return overlay;
}

module.exports = editorLoadingOverlay;
