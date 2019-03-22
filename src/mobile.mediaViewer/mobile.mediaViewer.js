var m = require( './../mobile.startup/moduleLoaderSingleton' ),
	overlay = require( '../mobile.startup/mediaViewer/overlay' ),
	ImageCarousel = require( './ImageCarousel' );

/**
 * @deprecated
 * @param {Object} options
 * @return {Overlay}
 */
function ImageOverlay( options ) {
	return overlay( options );
}

// Expose for Minerva
m.define( 'mobile.mediaViewer/ImageOverlay', ImageOverlay );
m.define( 'mobile.mediaViewer', {
	ImageCarousel
} );
