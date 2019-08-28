/* global $ */
module.exports = function () {
	var
		$contentContainer = $( '#mw-content-text > .mw-parser-output' ),
		currentPage = require( '../mobile.startup/currentPage' )(),
		Toggler = require( '../mobile.startup/Toggler' ),
		eventBus = require( '../mobile.startup/eventBusSingleton' );

	// If there was no mw-parser-output wrapper, just use the parent.
	if ( $contentContainer.length === 0 ) {
		$contentContainer = $( '#mw-content-text' );
	}

	/**
	 * Initialises toggling code.
	 *
	 * @method
	 * @param {JQuery.Object} $container to enable toggling on
	 * @param {string} prefix a prefix to use for the id.
	 * @param {Page} page The current page
	 * @ignore
	 */
	function init( $container, prefix, page ) {
		// Distinguish headings in content from other headings.
		$container.find( '> h1,> h2,> h3,> h4,> h5,> h6' ).addClass( 'section-heading' )
			.removeAttr( 'onclick' );
		// Cleanup global as it is no longer needed. We check if it's undefined because
		// there is no guarantee this won't be run on other skins e.g. Vector or cached HTML.
		if ( window.mfTempOpenSection !== undefined ) {
			delete window.mfTempOpenSection;
		}
		// eslint-disable-next-line no-new
		new Toggler( {
			$container: $container,
			prefix: prefix,
			page: page,
			eventBus: eventBus
		} );
	}

	if (
		// Avoid this running on Watchlist.
		!currentPage.inNamespace( 'special' ) &&
		mw.config.get( 'wgAction' ) === 'view'
	) {
		init( $contentContainer, 'content-', currentPage );
	}
};
