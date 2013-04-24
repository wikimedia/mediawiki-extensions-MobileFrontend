( function( $, M ) {

	function makePrettyDiff( $diff ) {
		var $diffclone = $diff.clone(), before = '', after = '',
			diff;

		$diffclone.find( 'del,ins' ).each( function() {
			if ( this.tagName === 'DEL' ) {
				before += $( this ).text() + '<br>';
			} else {
				after += $( this ).text() + '<br>';
			}
		} );
		$diff.empty().addClass( 'prettyDiff' );

		diff = JsDiff.diffWords( before, after );
		diff.forEach( function( change ) {
			var tag, vals;
			if ( change.added ) {
				tag = '<ins>';
			} else if ( change.removed ) {
				tag = '<del>';
			} else {
				tag = '<span>';
			}
			vals = change.value.split( '<br>' );
			vals.forEach( function( val ) {
				if ( val ) {
					$( tag ).text( val ).appendTo( $diff );
					if ( vals.length > 1 ) {
						$( '<br>' ).appendTo( $diff );
					}
				}
			} );
		} );

		return $diff;
	}

	$( function() {
		if ( mw.config.get( 'wgMFMode' ) !== 'stable' ) {
			makePrettyDiff( $( '#mw-mf-minidiff' ) );
		}
	} );

	M.define( 'diff', {
		makePrettyDiff: makePrettyDiff
	} );

} )( jQuery, mw.mobileFrontend );
