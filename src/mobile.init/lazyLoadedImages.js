/* global $ */
const lazyImageLoader = require( '../mobile.startup/lazyImages/lazyImageLoader' );

/**
 * Initialise lazy loading images to supplement the HTML changes inside the
 * MobileFormatter.
 */
function init() {
	if ( !mw.config.get( 'wgMFLazyLoadImages' ) ) {
		return;
	}

	const imagePlaceholders = lazyImageLoader.queryPlaceholders( document.getElementById( 'mw-content-text' ) );

	if ( 'IntersectionObserver' in window ) {
		const observer = new IntersectionObserver(
			( entries ) => {
				entries.forEach( ( entry ) => {
					const placeholder = entry.target;
					// If intersecting load image and stop observing it to free up resources.
					if ( entry.isIntersecting ) {
						lazyImageLoader.loadImage( placeholder );
						observer.unobserve( placeholder );
					}
				} );
			},
			// See https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
			{
				// Setup the area for observing.
				// By default the root is the viewport.
				// We want the detection area to be as tall as 150% of the viewport height,
				// allowing elements to be detected before they reach the viewport.
				// This is achieved with a 50% bottom margin.
				rootMargin: '0px 0px 50% 0px',
				// The default is 0 (meaning as soon as even one pixel is visible,
				// the callback will be run), however we explicitly set this so that
				// it is clear we have made this choice in case we want to revisit later.
				threshold: 0
			}
		);

		// observe all the placeholders
		imagePlaceholders.forEach( ( placeholder ) => {
			observer.observe( placeholder );
		} );
	} else {
		/**
		 * Adds the following class to identify the tap to click images on
		 * older browsers that do not support IntersectionObserver:
		 * lazy-image-placeholder--tap
		 */
		// eslint-disable-next-line mediawiki/class-doc
		$( imagePlaceholders ).addClass( `${lazyImageLoader.placeholderClass}--tap` );

		// Tap to show (see T246767)
		document.addEventListener( 'click', function ( ev ) {
			if ( imagePlaceholders.indexOf( ev.target ) > -1 ) {
				lazyImageLoader.loadImage( ev.target );
			}
		} );
	}
}

module.exports = init;
