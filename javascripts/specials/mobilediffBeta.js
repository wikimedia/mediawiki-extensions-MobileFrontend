( function( M, $ ) {

	function makePrettyDiff( $diff ) {
		var $diffclone = $diff.clone(), before = '', after = '',
			diff;

		$diffclone.find( 'del,ins' ).each( function() {
			var text = $( this ).text();
			if ( text ) {
				if ( this.tagName === 'DEL' ) {
					before += text + '\n';
				} else {
					after += $( this ).text() + '\n';
				}
			}
		} );
		// remove last 2 new lines
		if ( before ) {
			before = before.substr( 0, before.length - 1 );
		}
		if ( after ) {
			after = after.substr( 0, after.length - 1 );
		}

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
			vals = change.value.split( '\n' );
			vals.forEach( function( val, i ) {
				if ( val ) {
					$( tag ).text( val ).appendTo( $diff );
				}
				if ( i < vals.length - 1 ) {
					$( '<br>' ).appendTo( $diff );
				}
			} );
		} );

		return $diff;
	}

	$( function() {
		makePrettyDiff( $( '#mw-mf-minidiff' ) );
	} );

	M.define( 'diff', {
		makePrettyDiff: makePrettyDiff
	} );

} )( mw.mobileFrontend, jQuery );
