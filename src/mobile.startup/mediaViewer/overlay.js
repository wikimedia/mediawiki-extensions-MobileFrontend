/**
 * Internal for use inside Minerva only. See {@link module:mobile.startup} for access.
 *
 * @module mobile.startup/mediaViewer
 */
const m = require( '../moduleLoaderSingleton' ),
	promisedView = require( '../promisedView' ),
	util = require( '../util' ),
	header = require( '../headers' ).header,
	icons = require( '../icons' ),
	Overlay = require( '../Overlay' );

/**
 * Produce an overlay for mediaViewer
 *
 * @name overlay
 * @memberof module:mobile.startup/mediaViewer
 * @param {Object} options
 * @return {module:mobile.startup/Overlay}
 */
function mediaViewerOverlay( options ) {
	const overlay = Overlay.make(
		{
			headers: [
				header( '', [], icons.cancel( 'gray' ) )
			],
			className: 'overlay media-viewer'
		},
		promisedView(
			util.Promise.all( [
				mw.loader.using( 'mobile.mediaViewer' )
			] ).then( () => {
				const ImageCarousel = m.require( 'mobile.mediaViewer' ).ImageCarousel;
				return new ImageCarousel( options );
			} )
		)
	);

	return overlay;
}

module.exports = mediaViewerOverlay;
