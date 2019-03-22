var m = require( '../moduleLoaderSingleton' ),
	promisedView = require( '../promisedView' ),
	util = require( '../util' ),
	icons = require( '../icons' ),
	Overlay = require( '../Overlay' );

/**
 * Produce an overlay for talk page
 * @param {Object} options
 * @return {Overlay}
 */
function mediaViewerOverlay( options ) {
	var overlay = Overlay.make(
		{
			cancelButton: icons.cancel( 'gray' ).toHtmlString(),
			className: 'overlay media-viewer'
		},
		promisedView(
			util.Promise.all( [
				mw.loader.using( 'mobile.mediaViewer' )
			] ).then( function () {
				var ImageCarousel = m.require( 'mobile.mediaViewer' ).ImageCarousel;
				return new ImageCarousel( options );
			} )
		)
	);

	return overlay;
}

module.exports = mediaViewerOverlay;
