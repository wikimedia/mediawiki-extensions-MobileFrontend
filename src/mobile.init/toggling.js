module.exports = function () {
	var
		currentPage = require( '../mobile.startup/currentPage' )(),
		Toggler = require( '../mobile.startup/Toggler' ),
		eventBus = require( '../mobile.startup/eventBusSingleton' );

	/**
	 * Initialises toggling code.
	 *
	 * @method
	 * @param {jQuery.Object} $container to enable toggling on
	 * @param {string} prefix a prefix to use for the id.
	 * @param {Page} page The current page
	 * @ignore
	 */
	function init( $container, prefix, page ) {
		var headingsSelector = mw.config.get( 'wgMFMobileFormatterHeadings' ).map( function ( tagName ) {
			return '> ' + tagName;
		} ).join( ',' );
		// Distinguish headings in content from other headings.
		$container.find( headingsSelector ).addClass( 'section-heading' )
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
		mw.hook( 'wikipage.content' ).add( function ( $container ) {
			var $contentContainer = $container.find( '.mw-parser-output' );
			// If there was no mw-parser-output wrapper, just use the parent.
			if ( $contentContainer.length === 0 ) {
				$contentContainer = $container;
			}
			init( $contentContainer, 'content-', currentPage );
		} );
	}
};
