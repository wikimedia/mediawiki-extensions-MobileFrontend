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
 * @return {JQuery.Deferred<'load'|'error'>}
 */
module.exports.loadImage = function ( placeholder ) {
	var
		d = util.Deferred(),
		width = placeholder.getAttribute( 'data-width' ) || '0',
		height = placeholder.getAttribute( 'data-height' ) || '0',
		downloadingImage = new Image( parseInt( width, 10 ), parseInt( height, 10 ) );

	downloadingImage.className = placeholder.getAttribute( 'data-class' ) || '';
	downloadingImage.alt = placeholder.getAttribute( 'data-alt' ) || '';
	downloadingImage.setAttribute( 'style', placeholder.getAttribute( 'style' ) || '' );

	// When the image has loaded
	downloadingImage.addEventListener( 'load', function () {
		// Swap the HTML inside the placeholder (to keep the layout and
		// dimensions the same and not trigger layouts
		downloadingImage.classList.add( 'image-lazy-loaded' );
		if ( placeholder.parentNode ) {
			placeholder.parentNode.replaceChild( downloadingImage, placeholder );
		}
		d.resolve( 'load' );
	}, { once: true } );
	downloadingImage.addEventListener( 'error', function () {
		// Never reject. Quietly resolve so that jQuery.when() awaits for all Deferreds to complete.
		// Reevaluate using Deferred.reject in T136693.
		d.resolve( 'error' );
	}, { once: true } );

	// Trigger image download after binding the load handler
	downloadingImage.src = placeholder.getAttribute( 'data-src' ) || '';
	downloadingImage.srcset = placeholder.getAttribute( 'data-srcset' ) || '';
	return d;
};
