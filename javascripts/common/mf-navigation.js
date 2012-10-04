/*global document, window, mw, navigator, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
(function( MobileFrontend ) {
MobileFrontend.navigation = (function( $ ) {
	var u = MobileFrontend.utils, mfePrefix = MobileFrontend.prefix,
		lastScrollTopPosition = 0,
		M = MobileFrontend,
		message = MobileFrontend.message;

	function getOverlay() {
		return document.getElementById( 'mw-mf-overlay' );
	}

	function closeOverlay( ) {
		$( 'html' ).removeClass( 'overlay' );
		window.scrollTo( document.body.scrollLeft, lastScrollTopPosition );
		MobileFrontend.history.replaceHash( '#' );
	}

	function showOverlay() {
		lastScrollTopPosition = document.body.scrollTop;
		$( 'html' ).addClass( 'overlay' );
		window.scrollTo( 0, 0 ); // scroll right to top
		$( 'html' ).removeClass( 'navigationEnabled' );
	}

	function createOverlay( heading, contents, options ) {
		options = options || {};
		var overlay = document.getElementById( mfePrefix + 'overlay' );
		M.history.pushState( options.hash || '#mw-mf-overlay' );
		showOverlay();
		$( overlay ).empty();
		$( '<div class="header">' ).click( closeOverlay ).appendTo( '#' + mfePrefix + 'overlay' );
		$( '<button id="close"></button>' ).text( message( 'collapse-section' ) ).
			click( closeOverlay ).appendTo( '#' + mfePrefix + 'overlay' );
		if( typeof heading === 'string' ) {
			heading = $( '<h2 />' ).text( heading );
		}
		$( heading ).appendTo( '#' + mfePrefix + 'overlay .header' );
		$( overlay ).append( contents );
		$( contents ).addClass( 'content' );
		if( options.locked ) { // locked overlays cannot be escaped.
			$( '#mw-mf-overlay .header' ).addClass( 'mw-mf-locked' );
			$( '#mw-mf-overlay #close' ).remove();
		}
	}

	function init() {
		$( window ).bind( 'mw-mf-history-change', function( ev, curPage ) {
			if ( curPage.hash === '#' || curPage.hash === '' ) {
				closeOverlay();
			}
		} );
		$( '<div id="' + mfePrefix + 'overlay"></div>' ).appendTo( document.body );
		var search = document.getElementById(  mfePrefix + 'search' );

		function toggleNavigation() {
			var doc = document.documentElement;
			if( !u( doc ).hasClass( 'navigationEnabled' ) ) {
				u( doc ).addClass( 'navigationEnabled' );
			} else {
				u( doc ).removeClass( 'navigationEnabled' );
			}
			$( '#mw-mf-menu-main a' ).click( function( ev ) {
				toggleNavigation(); // close before following link so that certain browsers on back don't show menu open
			} );
		}
		$( '#' + mfePrefix + 'main-menu-button' ).click( function( ev ) {
			toggleNavigation();
			ev.preventDefault();
			ev.stopPropagation();
		} );

		if( window.location.hash === '#mw-mf-page-left' ) {
			u( document.body ).addClass( 'noTransitions' );
			window.setTimeout( function() {
				u( document.body ).removeClass( 'noTransitions' );
			}, 1000 );
		}

		u( search ).bind( 'focus', function() {
			u( document.documentElement ).removeClass( 'navigationEnabled' );
		} );
	}
	if( typeof( $ ) !== 'undefined' ) {
		init();
	}
	return {
		closeOverlay: closeOverlay,
		createOverlay: createOverlay,
		getOverlay: getOverlay,
		showOverlay: showOverlay
	};
}( jQuery ));
}( mw.mobileFrontend ));
