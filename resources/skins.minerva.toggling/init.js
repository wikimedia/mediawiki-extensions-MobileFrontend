( function ( M, $ ) {
	var page = M.getCurrentPage(),
		$contentContainer = $( '#mw-content-text > .mw-parser-output' ),
		Toggler = M.require( 'mobile.toggle/Toggler' );

	// If there was no mw-parser-output wrapper, just use the parent
	if ( $contentContainer.length === 0 ) {
		$contentContainer = $( '#mw-content-text' );
	}

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
		// distinguish headings in content from other headings
		$container.find( '> h1,> h2,> h3,> h4,> h5,> h6' ).addClass( 'section-heading' )
			.removeAttr( 'onclick' );
		// cleanup global as it is no longer needed. We check if it's undefined because
		// there is no guarantee this won't be run on other skins e.g. Vector or cached HTML
		if ( window.mfTempOpenSection !== undefined ) {
			delete window.mfTempOpenSection;
		}
		// eslint-disable-next-line no-new
		new Toggler( $container, prefix, page );
	}

	// avoid this running on Watchlist
	if (
		!page.inNamespace( 'special' ) &&
		!mw.config.get( 'wgIsMainPage' ) &&
		mw.config.get( 'wgAction' ) === 'view'
	) {
		init( $contentContainer, 'content-', page );
	}
}( mw.mobileFrontend, jQuery ) );
