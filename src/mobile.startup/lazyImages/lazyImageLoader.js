var
	util = require( '../util' ),
	Deferred = util.Deferred,
	when = util.when;

/**
 * Load an image on demand
 * @param {JQuery.find} find
 * @param {Array} images a list of images that have not been loaded.
 * @return {jQuery.Deferred}
 */
module.exports.loadImages = function ( find, images ) {
	var callbacks = images.map( function ( placeholder ) {
		return module.exports.loadImage( find( placeholder ) );
	} );

	return when.apply( null, callbacks );
};

/**
 * Load an image on demand
 * @param {jQuery.Object} $placeholder
 * @return {jQuery.Deferred}
 */
module.exports.loadImage = function ( $placeholder ) {
	var
		d = Deferred(),
		width = $placeholder.attr( 'data-width' ),
		height = $placeholder.attr( 'data-height' ),
		// document must be passed to ensure image will start downloading
		$downloadingImage = util.parseHTML( '<img>', $placeholder[0].ownerDocument );

	// When the image has loaded
	$downloadingImage.on( 'load', function () {
		// Swap the HTML inside the placeholder (to keep the layout and
		// dimensions the same and not trigger layouts
		$downloadingImage.addClass( 'image-lazy-loaded' );
		$placeholder.replaceWith( $downloadingImage );
		d.resolve();
	} );
	$downloadingImage.on( 'error', function () {
		d.reject();
	} );

	// Trigger image download after binding the load handler
	$downloadingImage.attr( {
		class: $placeholder.attr( 'data-class' ),
		width: width,
		height: height,
		src: $placeholder.attr( 'data-src' ),
		alt: $placeholder.attr( 'data-alt' ),
		style: $placeholder.attr( 'style' ),
		srcset: $placeholder.attr( 'data-srcset' )
	} );
	return d;
};
