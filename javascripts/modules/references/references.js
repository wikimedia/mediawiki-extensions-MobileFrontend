( function ( M, $ ) {
	var Drawer = M.require( 'Drawer' ),
		Icon = M.require( 'Icon' ),
		ReferencesDrawer, drawer;

	/**
	 * Drawer for references
	 * @class ReferencesDrawer
	 * @extends Drawer
	 */
	ReferencesDrawer = Drawer.extend( {
		defaults: {
			cancelButton: new Icon( {
				name: 'cancel', additionalClassNames: 'cancel',
				label: mw.msg( 'mobile-frontend-overlay-close' )
			} ).toHtmlString()
		},
		className: 'drawer position-fixed text references',
		template: mw.template.get( 'mobile.references', 'Drawer.hogan' )
	} );

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
		var $container = page ? page.$el : $( '#content' );
		$container.find( 'sup a' ).off( 'click' ).on( 'click', showReference );
		$container.find( '.mw-cite-backlink a' ).off( 'click' );
	}

	$( function () {
		drawer = new ReferencesDrawer();
		setup();
	} );

	M.define( 'references', { setup: setup } );

}( mw.mobileFrontend, jQuery ) );
