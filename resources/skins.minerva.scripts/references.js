( function ( M, $ ) {
	var drawer,
		page = M.getCurrentPage();

	/**
	 * Retrieves the references gateway module info to be used on the page from config
	 *
	 * @method
	 * @ignore
	 * @returns {String} name of the class implementing ReferenceGateway to use
	 */
	function getReferenceGatewayClassName() {
		return mw.config.get( 'wgMFLazyLoadReferences', false ) ?
			'ReferencesMobileViewGateway' : 'ReferencesHtmlScraperGateway';
	}

	/**
	 * Creates a ReferenceDrawer based on the currently available ReferenceGateway
	 *
	 * @ignore
	 * @returns {ReferencesDrawer}
	 */
	function referenceDrawerFactory() {
		var gatewayClassName = getReferenceGatewayClassName(),
			ReferencesGateway = M.require( 'mobile.references.gateway/' + gatewayClassName ),
			ReferencesDrawer = M.require( 'mobile.references/ReferencesDrawer' );

		return new ReferencesDrawer( {
			gateway: new ReferencesGateway( new mw.Api() )
		} );
	}

	/**
	 * Event handler to show reference when a reference link is clicked
	 * @ignore
	 * @param {jQuery.Event} ev Click event of the reference element
	 * @param {ReferencesDrawer} drawer to show the reference in
	 */
	function showReference( ev, drawer ) {
		var $dest = $( ev.target ),
			href = $dest.attr( 'href' );

		ev.preventDefault();

		drawer.showReference( href, page, $dest.text() );

		// don't hide drawer (stop propagation of click) if it is already shown (e.g. click another reference)
		if ( drawer.isVisible() ) {
			ev.stopPropagation();
		} else {
			// flush any existing reference information
			drawer.render( {
				text: undefined
			} );
			// use setTimeout so that browser calculates dimensions before show()
			setTimeout( $.proxy( drawer, 'show' ), 0 );
		}
	}

	/**
	 * Event handler to show reference when a reference link is clicked.
	 * Delegates to `showReference` once the references drawer is ready.
	 *
	 * @ignore
	 * @param {jQuery.Event} ev Click event of the reference element
	 */
	function onClickReference( ev ) {
		if ( !drawer ) {
			drawer = referenceDrawerFactory();
		}
		showReference( ev, drawer );
	}

	/**
	 * Make references clickable and show a drawer when clicked on.
	 * @ignore
	 * @param {Page} page
	 */
	function setup( page ) {
		var $refs = page.$( 'sup a' );

		if ( $refs.length ) {
			$refs
				.off( 'click' )
				.on( 'click', onClickReference );
			page.$( '.mw-cite-backlink a' )
				.off( 'click' );
		}
	}

	// Setup
	$( function () {
		setup( page );
	} );

}( mw.mobileFrontend, jQuery ) );
