var
	Overlay = require( './Overlay' ),
	mfExtend = require( './mfExtend' );

/**
 * Overlay that initially shows loading animation until
 * caller hides it with .hide()
 * @class LoadingOverlay
 * @extends Overlay
 */
function LoadingOverlay() {
	Overlay.call( this, {
		className: 'overlay overlay-loading'
	} );
}

mfExtend( LoadingOverlay, Overlay, {
	/**
	 * @memberof LoadingOverlay
	 * @instance
	 */
	template: mw.template.get( 'mobile.startup', 'LoadingOverlay.hogan' )
} );

module.exports = LoadingOverlay;
