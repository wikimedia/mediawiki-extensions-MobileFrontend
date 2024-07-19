const
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
 *
 * @param {HTMLElement[]} placeholders a list of images that have not been loaded.
 * @return {jQuery.Deferred}
 */
function loadImages( placeholders ) {
	return util.Promise.all(
		placeholders.map( ( placeholder ) => module.exports.loadImage( placeholder ).promise )
	);
}

/**
 * Load an image on demand
 *
 * @param {HTMLElement} placeholder
 * @return {{promise: jQuery.Deferred<'load'|'error'>, image: HTMLImageElement}}
 */
function loadImage( placeholder ) {
	const
		deferred = util.Deferred(),
		// data-width and height are attributes and do not specify dimension.
		width = placeholder.dataset.width,
		height = placeholder.dataset.height,
		image = new Image();

	if ( width ) {
		image.setAttribute( 'width', parseInt( width, 10 ) );
	}
	if ( height ) {
		image.setAttribute( 'height', parseInt( height, 10 ) );
	}

	// eslint-disable-next-line mediawiki/class-doc
	image.className = placeholder.dataset.class || '';
	image.alt = placeholder.dataset.alt || '';
	image.useMap = placeholder.dataset.usemap;
	image.style.cssText = placeholder.style.cssText || '';

	// When the image has loaded
	image.addEventListener( 'load', () => {
		// Swap the HTML inside the placeholder (to keep the layout and
		// dimensions the same and not trigger layouts
		image.classList.add( 'image-lazy-loaded' );
		if ( placeholder.parentNode ) {
			placeholder.parentNode.replaceChild( image, placeholder );
		}
		deferred.resolve( 'load' );
	}, { once: true } );
	image.addEventListener( 'error', () => {
		// Swap the HTML and let the browser decide what to do with the broken image.
		if ( placeholder.parentNode ) {
			placeholder.parentNode.replaceChild( image, placeholder );
		}
		// Never reject. Quietly resolve so that Promise.all() awaits for all Deferreds to complete.
		// Reevaluate using Deferred.reject in T136693.
		deferred.resolve( 'error' );
	}, { once: true } );

	// Trigger image download after binding the load handler
	image.src = placeholder.dataset.src || '';
	image.srcset = placeholder.dataset.srcset || '';

	return {
		promise: deferred,
		image
	};
}

module.exports = {
	placeholderClass,
	queryPlaceholders,
	loadImages,
	loadImage,
	test: {
		placeholderClass
	}
};
