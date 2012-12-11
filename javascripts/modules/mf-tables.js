( function( M,  $ ) {

var module = (function() {
	var nav = M.getModule( 'navigation' );

	function initTables( ev, container ) {
		var $tables = container ? $( container ).find( 'table' ) : $( 'table' );

		$tables.each( function( i ) {
			var $t = $( this ),
				$block, tableNo = i + 1,
				sectionNo, tableId,
				$container = $( '<div>' );

			if ( $( this ).parents( 'table' ).length === 0 ) {
				$block = $( this ).parents( '.content_block' );
				if ( $block ) {
					sectionNo = parseInt( $block.attr( 'id' ).split( '_' )[ 1 ], 10 ) + 1;
					tableId = sectionNo + '.' + tableNo;
					$container.append( $t.clone() );
					$( '<button>' ).click( function() {
						nav.createOverlay( $( this ).text(), $container[ 0 ] );
					} ).text( M.message( 'mobile-frontend-table', tableId ) ).insertBefore( this );
					$t.remove();
				}
			}
		} );
	}

	$( window ).on( 'mw-mf-section-rendered', function( ev, container ) {
			initTables( ev, container );
		} );

	return {
	};
}() );

M.registerModule( 'tables', module );

}( mw.mobileFrontend, jQuery ));
