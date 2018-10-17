var
	icons = require( './icons' ),
	Overlay = require( './Overlay' );

/**
 * Overlay that initially shows loading animation until
 * caller hides it with .hide()
 *
 * @return {Overlay}
 */
function loadingOverlay() {
	var overlay = new Overlay( {
		className: 'overlay overlay-loading',
		noHeader: true
	} );
	icons.spinner().$el.appendTo( overlay.$( '.overlay-content' ) );
	return overlay;
}

module.exports = loadingOverlay;
