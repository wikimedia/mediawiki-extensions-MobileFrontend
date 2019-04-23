var m = require( '../mobile.startup/moduleLoaderSingleton' ),
	ImageCarousel = require( './ImageCarousel' );

// Needed for lazy loading ImageCarousel
m.define( 'mobile.mediaViewer', {
	ImageCarousel
} );
