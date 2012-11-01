/*global mw, window, document, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
( function( M, $ ) {
	M.navigation.popup = ( function() {
		var calculatePosition = function() {};

		if ( !M.supportsPositionFixed() ) {
			calculatePosition = function() {
				var h = $( '#mf-references' ).outerHeight();
				$( '#mf-references' ).css( {
					top:  ( window.innerHeight + window.pageYOffset ) - h,
					bottom: 'auto',
					position: 'absolute'
				} );
			};
			$( document ).scroll( calculatePosition );
		}

		function isVisible() {
			return $( '#mf-references' ).is( ':visible' );
		}

		function show( html, classes ) {
			$( '#mf-references div' ).removeAttr( 'class' ).
				addClass( classes ).
				html( html );
			calculatePosition();
			return $( '#mf-references' ).show();
		}

		function close() {
			if ( !$( '#mf-references' ).is( ':visible' ) ) {
				return;
			}
			$( '#mf-references' ).hide();
		}

		function init( firstRun ) {
			var el = $( '<div id="mf-references"><div></div></div>' ).hide().
				appendTo( document.body )[ 0 ];

			firstRun = firstRun === undefined ? true : firstRun;

			function cancelBubble( ev ) {
				ev.stopPropagation();
			}
			el.ontouchstart = cancelBubble;
			$( '<button>close</button>' ).click( close ).appendTo( '#mf-references' );

			if ( firstRun ) {
				$( window ).scroll( function() {
					close();
				} );

				$( document.body ).bind( 'click', close ).bind( 'touchstart', function() {
					$( '#mf-references' ).hide();
				} );
			}
		}

		init();
		return {
			close: close,
			isVisible: isVisible,
			show: show
		};

	}() );

}( mw.mobileFrontend, jQuery ) );
