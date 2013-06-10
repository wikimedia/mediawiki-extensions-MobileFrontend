(function( M ) {

var m = ( function( $ ) {
	var
		menu,
		mfePrefix = M.prefix,
		inBeta = mw.config.get( 'wgMFMode' ) === 'beta';

	function openNavigation() {
		$( 'body' ).addClass( 'navigation-enabled' );
	}

	function closeNavigation() {
		$( 'body' ).removeClass( 'navigation-enabled' );
	}

	$( function() {
		var
			search = document.getElementById(  'searchInput' );

		$( '#mw-mf-menu-main a' ).click( function() {
			toggleNavigation(); // close before following link so that certain browsers on back don't show menu open
		} );

		function isOpen() {
			return $( 'body' ).hasClass( 'navigation-enabled' );
		}

		function toggleNavigation() {
			if( !isOpen() ) {
				openNavigation();
			} else {
				closeNavigation();
			}
		}
		$( '#' + mfePrefix + 'main-menu-button' ).click( function( ev ) {
			toggleNavigation();
			ev.preventDefault();
		} ).on( 'touchend', function( ev ) {
			ev.stopPropagation();
		} );

		// close navigation if content tapped
		$( '#mw-mf-page-center' ).on( 'touchend', function() {
			if ( isOpen() ) {
				closeNavigation();
			}
		} );

		if( window.location.hash === '#mw-mf-page-left' ) {
			openNavigation();
			$( 'body' ).addClass( 'noTransitions' );
			window.setTimeout( function() {
				$( 'body' ).removeClass( 'noTransitions' );
			}, 1000 );
		}

		$( search ).bind( 'focus', function() {
			if ( !inBeta || $( window ).width() < 700 ) {
				closeNavigation();
			}
		} );
	} );

	menu = {
		close: closeNavigation,
		open: openNavigation
	};

	return {
		getMenu: menu
	};
}( jQuery ));

M.define( 'navigation', m );

}( mw.mobileFrontend ));
