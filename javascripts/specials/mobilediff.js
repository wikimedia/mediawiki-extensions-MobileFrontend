( function( $, M ) {

	function makePrettyDiff( $diff ) {
		var $diffclone = $diff.clone();

		if ( $diff.children( 'ins' ).length === 0 ) { // if just a delete do nothing
			$diff.empty().addClass( 'prettyDiff' );
			$diffclone.find( 'del' ).each( function() {
				$( this ).clone().appendTo( $diff );
				$( '<br>' ).appendTo( $diff );
			} );
			return $diff;
		} else if ( $diff.children().length > 1 ) { // if there is only one line it is not a complicated diff
			$diff.empty().addClass( 'prettyDiff' );
			$diffclone.find( 'ins' ).each( function() {
				var $del = $( this ).prev( 'del' ), $add = $( this ),
					diffChars;

				if ( $del.length > 0 ) {
					while ( $add.next()[ 0 ] && $add.next()[ 0 ].tagName === 'INS' ) {
						$add.clone().appendTo( $diff );
						$( '<br>' ).appendTo( $diff );
						$add = $add.next();
					}

					diffChars = JsDiff.diffChars( $del.text(), $add.text() );
					diffChars.forEach( function( change ) {
						var tag;
						if ( change.added ) {
							tag = '<ins>';
						} else if ( change.removed ) {
							tag = '<del>';
						} else {
							tag = '<span>';
						}
						$( tag ).text( change.value ).appendTo( $diff );
					} );
				} else if ( $add.prev()[ 0 ].tagName !== 'INS' ){
					$add.clone().css( 'display', 'inline' ).appendTo( $diff );
				}

				$( '<br>' ).appendTo( $diff );
			} );
		}
		return $diff;
	}

	$( function() {
		if ( mw.config.get( 'wgMFMode' ) === 'alpha' ) {
			makePrettyDiff( $( '#mw-mf-minidiff' ) );
		}
	} );

	M.define( 'diff', {
		makePrettyDiff: makePrettyDiff
	} );

} )( jQuery, mw.mobileFrontend );
