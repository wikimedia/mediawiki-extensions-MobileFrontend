( function ( M, $ ) {
	var drawer;

	function getReference( id ) {
		// Escape (almost) all CSS selector meta characters
		// see http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		var meta = /[!"$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g;
		id = id.replace( meta, '\\$&' );
		// Use find rather than string concatenation
		return $( 'ol.references' ).find( id );
	}

	function showReference( ev ) {
		var $dest = $( this );
		drawer.render( {
			title: $dest.text(),
			text: getReference( $dest.attr( 'href' ) ).html()
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

	M.define( 'references', { setup: setup } );

}( mw.mobileFrontend, jQuery ) );
