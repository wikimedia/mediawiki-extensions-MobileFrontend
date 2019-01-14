var util = require( '../util' );

/**
 * @param {HTMLElement} root
 * @return {HTMLElement[]}
 */
module.exports.queryPlaceholders = function ( root ) {
	return Array.prototype.slice.call( root.querySelectorAll( '.lazy-image-placeholder' ) );
};

/**
 * Load an image on demand
 * @param {HTMLElement[]|JQuery.find} placeholdersOrDeprecatedFind a list of images that have not
 *                                                                 been loaded.
 * @param {HTMLElement[]} deprecatedPlaceholders
 * @return {jQuery.Deferred}
 */
module.exports.loadImages = function ( placeholdersOrDeprecatedFind, deprecatedPlaceholders ) {
	var placeholders =
		typeof placeholdersOrDeprecatedFind === 'function' ?
			deprecatedPlaceholders :
			placeholdersOrDeprecatedFind;

	// jQuery.when() is variadic and does not accept an array. Simulate spread with apply.
	return util.when.apply( util, placeholders.map( function ( placeholder ) {
		return module.exports.loadImage( placeholder );
	} )
	);
};

/**
 * Load an image on demand
 * @param {HTMLElement} placeholder
 * @return {jQuery.Deferred}
 */
module.exports.loadImage = function ( placeholder ) {
	var
		d = util.Deferred(),
		width = placeholder.getAttribute( 'data-width' ),
		height = placeholder.getAttribute( 'data-height' ),
		// document must be passed to ensure image will start downloading
		$downloadingImage = util.parseHTML( '<img>', placeholder.ownerDocument );

	// When the image has loaded
	$downloadingImage.on( 'load', function () {
		// Swap the HTML inside the placeholder (to keep the layout and
		// dimensions the same and not trigger layouts
		$downloadingImage.addClass( 'image-lazy-loaded' );
		if ( placeholder.parentNode ) {
			placeholder.parentNode.replaceChild( $downloadingImage[0], placeholder );
		}
		d.resolve();
	} );
	$downloadingImage.on( 'error', function () {
		d.reject();
	} );

	// Trigger image download after binding the load handler
	$downloadingImage.attr( {
		class: placeholder.getAttribute( 'data-class' ),
		width: width,
		height: height,
		src: placeholder.getAttribute( 'data-src' ),
		alt: placeholder.getAttribute( 'data-alt' ),
		style: placeholder.getAttribute( 'style' ),
		srcset: placeholder.getAttribute( 'data-srcset' )
	} );
	return d;
};
