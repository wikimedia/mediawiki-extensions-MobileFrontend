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
		// use setTimeout so that browser calculates dimensions before show()
		setTimeout( $.proxy( drawer, 'show' ), 0 );
		ev.preventDefault();
	}

	function setup( $container ) {
		$container = $container || $( '#content' );
		$container.find( 'sup a' ).off( 'click' ).on( 'click', showReference );
		$container.find( '.mw-cite-backlink a' ).off( 'click' );
	}

	$( function() {
		drawer = new ReferencesDrawer();
		setup();
	} );
	M.on( 'section-rendered references-loaded', setup );

	M.define( 'references', { setup: setup } );

}( mw.mobileFrontend, jQuery ) );
