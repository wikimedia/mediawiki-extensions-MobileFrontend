( function( M, $ ) {
	var Drawer = M.require( 'Drawer' ), ReferencesDrawer, drawer;

	ReferencesDrawer = Drawer.extend( {
		className: 'drawer position-fixed text references',
		template: M.template.get( 'ReferencesDrawer' )
	} );

	function getReference( id ) {
		// escape dots in id so that jQuery doesn't treat them as CSS classes
		id = id.replace( /\./g, '\\.' );
		return $( 'ol.references li' + id ).html();
	}

	function showReference( ev ) {
		drawer.render( {
			title: $( this ).text(),
			text: getReference( $( this ).attr( 'href' ) )
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

	$( function() {
		drawer = new ReferencesDrawer();
		setup();
	} );
	M.on( 'page-loaded', setup );

	M.define( 'references', { setup: setup } );

}( mw.mobileFrontend, jQuery ) );
