( function ( M, $ ) {
	var drawer,
		MobileWebClickTracking = M.require( 'loggingSchemas/MobileWebClickTracking' );

	/**
	 * Return the matched reference among the children of ol.references
	 * @method
	 * @ignore
	 * @param {String} id CSS selector
	 * @returns {jQuery.Object} reference that matches id
	 */
	function getReference( id ) {
		// Escape (almost) all CSS selector meta characters
		// see http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		var meta = /[!"$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g;
		id = id.replace( meta, '\\$&' );
		// Use find rather than string concatenation
		return $( 'ol.references' ).find( id );
	}

	/**
	 * Show reference
	 * @method
	 * @ignore
	 * @param {jQuery.Event} ev Event object
	 * @uses loggingSchemas/MobileWebClickTracking
	 */
	function showReference( ev ) {
		var $dest = $( this ),
			href = $dest.attr( 'href' );

		MobileWebClickTracking.log( 'UI', 'reference', href );
		drawer.render( {
			title: $dest.text(),
			text: getReference( href ).html()
		} );
		ev.preventDefault();
		//don't hide drawer (stop propagation of click) if it is already shown (e.g. click another reference)
		if ( drawer.isVisible() ) {
			ev.stopPropagation();
		} else {
			// use setTimeout so that browser calculates dimensions before show()
			setTimeout( $.proxy( drawer, 'show' ), 0 );
		}
	}

	/**
	 * Make references clickable and show a drawer when clicked on.
	 * @method
	 * @ignore
	 * @param {Page} page
	 */
	function setup( page ) {
		var $container = page ? page.$el : $( '#content' ),
			module, view, ReferencesDrawer;

		if ( M.isBetaGroupMember() ) {
			module = 'mobile.references.beta';
			view = 'modules/references/ReferencesDrawerBeta';
		} else {
			module = 'mobile.references';
			view = 'modules/references/ReferencesDrawer';
		}

		mw.loader.using( module ).done( function () {
			ReferencesDrawer = M.require( view );
			drawer = new ReferencesDrawer();
			$container.find( 'sup a' ).off( 'click' ).on( 'click', showReference );
			$container.find( '.mw-cite-backlink a' ).off( 'click' );
		} );

	}

	$( function () {
		setup();
	} );

	M.define( 'references', {
		setup: setup
	} );

}( mw.mobileFrontend, jQuery ) );
