var m = require( '../mobile.startup/moduleLoaderSingleton' ),
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

// Needed for lazy loading ImageCarousel
m.define( 'mobile.mediaViewer', {
	ImageCarousel
} );
// Expose for Minerva
m.deprecate( 'mobile.mediaViewer/ImageOverlay', ImageOverlay, 'mobile.startup' );
