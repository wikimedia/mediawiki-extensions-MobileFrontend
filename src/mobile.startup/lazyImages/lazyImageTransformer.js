var
	lazyImageLoader = require( './lazyImageLoader' ),
	util = require( '../util' );

/**
 * Setup listeners to watch unloaded images and load them into the page
 * as and when they are needed.
 * @param {OO.EventEmitter} eventBus
 * @param {JQuery.find} find
 * @param {number} offset
 * @param {HTMLElement[]} imagePlaceholders
 * @return {{loadImages: function(): void}}.
 */
function newLazyImageTransformer( eventBus, find, offset, imagePlaceholders ) {
	/**
	 * Load remaining images in viewport
	 * @return {jQuery.Deferred}
	 */
	function loadImages() {
		var placeholders = [];
		// Filter unloaded images to only the images that still need to be loaded
		imagePlaceholders = util.grep( imagePlaceholders, function ( placeholder ) {
			var $placeholder = find( placeholder );
			// Check length to ensure the image is still in the DOM.
			if ( $placeholder.length && shouldLoadImage( $placeholder, offset ) ) {
				placeholders.push( placeholder );
				return false;
			}
			return true;
		} );

		// When no images are left unbind all events
		if ( !imagePlaceholders.length ) {
			eventBus.off( 'scroll:throttled', loadImages );
			eventBus.off( 'resize:throttled', loadImages );
			eventBus.off( 'section-toggled', loadImages );
		}

		// load any remaining images.
		return lazyImageLoader.loadImages( placeholders );
	}

	eventBus.on( 'scroll:throttled', loadImages );
	eventBus.on( 'resize:throttled', loadImages );
	eventBus.on( 'section-toggled', loadImages );

	return {
		loadImages: loadImages
	};
}

/**
 * Check whether an image should be loaded based on its proximity to the
 * viewport; and whether it is displayed to the user.
 * @param {jQuery.Object} $placeholder
 * @param {number} offset
 * @return {boolean}
 */
function shouldLoadImage( $placeholder, offset ) {
	return mw.viewport.isElementCloseToViewport( $placeholder[0], offset ) &&
		// If a placeholder is an inline element without a height attribute set
		// it will record as hidden
		// to circumvent this we also need to test the height (see T143768).
		// eslint-disable-next-line no-jquery/no-sizzle
		( $placeholder.is( ':visible' ) || $placeholder.height() === 0 );
}

module.exports = {
	newLazyImageTransformer: newLazyImageTransformer
};
