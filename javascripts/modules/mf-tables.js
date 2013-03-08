( function( M,  $ ) {

( function() {
	var STEP_SIZE = 150;

	function initTables( $container ) {
		var nav = M.require( 'navigation' ),
			$tables = $container ? $container.find( 'table' ) : $( 'table' );

		$tables.each( function( i ) {
			var $t = $( this ),
				$tc = $t.find( 'tbody' ),
				$block, tableNo = i + 1,
				sectionNo, tableId,
				colspan, $tr, maxHeight, $td,
				$container = $( '<div class="tableContent">' );

			if ( $t.parents( 'table' ).length === 0 && $tc.length > 0 ) {
				$block = $t.parents( '.content_block' );
				if ( $block ) {
					$t.addClass( 'expando' ).css( { height: STEP_SIZE } );
					maxHeight = $tc.height();

					sectionNo = parseInt( $block.attr( 'id' ).split( '_' )[ 1 ], 10 ) + 1;
					tableId = sectionNo + '.' + tableNo;
					$container.append( $t.clone() );
					$td = $t.find( 'tr' ).find( 'td' );
					colspan = $td.eq( 0 ).attr( 'colspan' ) || $td.length;

					$tr = $( '<tr class="overlayZoomer">' ).prependTo( $tc );
					$( '<td>' ).attr( 'colspan', colspan ).click( function() {
						nav.createOverlay( $( this ).text(), $container[ 0 ] );
					} ).text( M.message( 'mobile-frontend-table', tableId ) ).appendTo( $tr );

					// make the vertical expando
					$tr = $( '<tr class="expandoVertical">' ).appendTo( $tc );
					$( '<td>&nbsp;</td>' ).attr( 'colspan', colspan ).appendTo( $tr );
					$tr.on( 'click', function() {
						var height,
							expand = $tr.hasClass( 'expanded' ) ? true : false;
						height = expand ? STEP_SIZE : '';
						$t.css( 'height', height );
						$tr.toggleClass( 'expanded' );
						window.scrollTo( 0, $tr.offset().top );
					} );

				}
			}
		} );
	}

	M.
		on( 'page-loaded', function() {
			initTables( $( '#content_0' ) );
		} ).
		on( 'section-rendered', initTables );
}() );

}( mw.mobileFrontend, jQuery ));
