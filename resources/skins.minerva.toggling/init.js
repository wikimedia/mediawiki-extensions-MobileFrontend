( function ( M, $ ) {
	var page = M.getCurrentPage(),
		// FIXME: Clean up when cache clears.
		$contentContainer = $( '#content #bodyContent, #content_wrapper #content' ),
		toggle = M.require( 'toggle' );

	/**
	 * Initialises toggling code.
	 *
	 * @method
	 * @param {jQuery.Object} $container to enable toggling on
	 * @param {String} prefix a prefix to use for the id.
	 * @ignore
	 */
	function init( $container, prefix ) {
		// distinguish headings in content from other headings
		$container.find( '> h1,> h2,> h3,> h4,> h5,> h6' ).addClass( 'section-heading' );
		toggle.enable( $container, prefix );
	}

	// avoid this running on Watchlist
	if (
		!page.inNamespace( 'special' ) &&
		!mw.config.get( 'wgIsMainPage' ) &&
		mw.config.get( 'wgAction' ) === 'view'
	) {
		init( $contentContainer, 'content-' );
	}
}( mw.mobileFrontend, jQuery ) );
