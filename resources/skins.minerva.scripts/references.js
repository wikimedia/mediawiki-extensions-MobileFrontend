( function ( M, $ ) {
	var drawer,
		skin = M.require( 'skins.minerva.scripts/skin' ),
		page = M.getCurrentPage(),
		ReferencesMobileViewGateway = M.require(
			'mobile.references.gateway/ReferencesMobileViewGateway'
		),
		referencesMobileViewGateway = ReferencesMobileViewGateway.getSingleton(),
		ReferencesHtmlScraperGateway = M.require(
			'mobile.references.gateway/ReferencesHtmlScraperGateway'
		),
		ReferencesDrawer = M.require( 'mobile.references/ReferencesDrawer' );

	/**
	 * Creates a ReferenceDrawer based on the currently available
	 * ReferenceGateway
	 *
	 * @ignore
	 * @return {ReferencesDrawer}
	 */
	function referenceDrawerFactory() {
		var gateway = null;

		if ( mw.config.get( 'wgMFLazyLoadReferences', false ) ) {
			gateway = referencesMobileViewGateway;
		} else {
			gateway = new ReferencesHtmlScraperGateway( new mw.Api() );
		}

		return new ReferencesDrawer( {
			gateway: gateway
		} );
	}

	/**
	 * Event handler to show reference when a reference link is clicked
	 * @ignore
	 * @param {jQuery.Event} ev Click event of the reference element
	 * @param {ReferencesDrawer} drawer to show the reference in
	 * @param {Page} page
	 */
	function showReference( ev, drawer, page ) {
		var urlComponents,
			$dest = $( ev.currentTarget ),
			href = $dest.attr( 'href' );

		ev.preventDefault();

		// If necessary strip the URL portion of the href so we are left with the
		// fragment
		urlComponents = href.split( '#' );
		if ( urlComponents.length > 1 ) {
			href = '#' + urlComponents[1];
		}
		drawer.showReference( href, page, $dest.text() );

		// don't hide drawer (stop propagation of click) if it is already shown
		// (e.g. click another reference)
		if ( drawer.isVisible() ) {
			ev.stopPropagation();
		} else {
			// flush any existing reference information
			drawer.render( {
				text: undefined
			} );
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
		showReference( ev, drawer, ev.data.page );
	}

	/**
	 * Make references clickable and show a drawer when clicked on.
	 * @ignore
	 * @param {Page} page
	 */
	function setup( page ) {
		var $refs = page.$( 'sup.reference a' );

		if ( $refs.length ) {
			$refs
				.off( 'click' )
				.on( 'click', {
					page: page
				}, onClickReference );
			page.$( '.mw-cite-backlink a' )
				.off( 'click' );
		}
	}

	setup( page );
	// When references are lazy loaded you'll want to take care of nested references
	skin.on( 'references-loaded', function ( page ) {
		setup( page );
	} );
}( mw.mobileFrontend, jQuery ) );
