var
	util = require( '../util' ),
	placeholderClass = 'lazy-image-placeholder';

/**
 * @param {HTMLElement} root
 * @return {HTMLElement[]}
 */
function queryPlaceholders( root ) {
	return Array.prototype.slice.call(
		root.getElementsByClassName( placeholderClass )
	);
}

/**
 * Load an image on demand
 * @param {HTMLElement[]} placeholders a list of images that have not been loaded.
 * @return {JQuery.Deferred}
 */
function loadImages( placeholders ) {
	return util.Promise.all(
		placeholders.map( function ( placeholder ) {
			return module.exports.loadImage( placeholder ).promise;
		} )
	);
}

/**
 * Load an image on demand
 * @param {HTMLElement} placeholder
 * @return {{promise: JQuery.Deferred<'load'|'error'>, image: HTMLImageElement}}
 */
function loadImage( placeholder ) {
	var
		deferred = util.Deferred(),
		// data-width and height are attributes and do not specify dimension.
		width = placeholder.dataset.width || '0',
		height = placeholder.dataset.height || '0',
		image = new Image( parseInt( width, 10 ), parseInt( height, 10 ) );

	image.className = placeholder.dataset.class || '';
	image.alt = placeholder.dataset.alt || '';
	image.style.cssText = placeholder.style.cssText || '';

	// When the image has loaded
	image.addEventListener( 'load', function () {
		// Swap the HTML inside the placeholder (to keep the layout and
		// dimensions the same and not trigger layouts
		image.classList.add( 'image-lazy-loaded' );
		if ( placeholder.parentNode ) {
			placeholder.parentNode.replaceChild( image, placeholder );
		}
		deferred.resolve( 'load' );
	}, { once: true } );
	image.addEventListener( 'error', function () {
		// Never reject. Quietly resolve so that jQuery.when() awaits for all Deferreds to complete.
		// Reevaluate using Deferred.reject in T136693.
		deferred.resolve( 'error' );
	}, { once: true } );

	// Trigger image download after binding the load handler
	image.src = placeholder.dataset.src || '';
	image.srcset = placeholder.dataset.srcset || '';

	return {
		promise: deferred,
		image: image
	};
}

module.exports = {
	queryPlaceholders: queryPlaceholders,
	loadImages: loadImages,
	loadImage: loadImage,
	test: {
		placeholderClass: placeholderClass
	}
};
