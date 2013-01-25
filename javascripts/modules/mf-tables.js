( function( M,  $ ) {

var module = (function() {
	var STEP_SIZE = 150;

	function initTables( ev, container ) {
		var nav = M.require( 'navigation' ),
			$tables = container ? $( container ).find( 'table' ) : $( 'table' );

		$tables.each( function( i ) {
			var $t = $( this ),
				$tc = $t.find( 'tbody' ),
				$block, tableNo = i + 1,
				sectionNo, tableId,
				colspan, $tr, maxHeight, $td,
				$container = $( '<div class="tableContent">' );

			if ( $t.parents( 'table' ).length === 0 && $tc.length > 1 ) {
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
					$( '<td>' ).text( 'more' ).attr( 'colspan', colspan ).appendTo( $tr );
					$tr.on( 'click', function() {
						var oldHeight = $t.height(),
							newHeight = oldHeight + STEP_SIZE;
						if ( newHeight < maxHeight ) {
							$t.height( newHeight );
						} else {
							$t.css( 'height', '' );
							$tr.remove();
						}
					} );

				}
			}
		} );
	}

	M.on( 'page-loaded',
		function() {
			initTables( $( '#content_0' ) );
		} ).on( 'section-rendered', function( ev, container ) {
			initTables( ev, container );
		} );

	return {
	};
}() );

M.define( 'tables', module );

}( mw.mobileFrontend, jQuery ));
