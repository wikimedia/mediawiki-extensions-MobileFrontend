/*global document, window, MobileFrontend, navigator, placeholder */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
MobileFrontend.navigation = (function() {
	var u = MobileFrontend.utils, mfePrefix = MobileFrontend.prefix,
		message = MobileFrontend.message;

	function resetActionBar() {
		var menu = $( '#' + mfePrefix + 'nav' )[0];
		menu.style.display = '';
	}

	function toggleActionBar() {
		var menu = $( '#' + mfePrefix + 'nav' )[0];
		if( menu.style.display ) {
			resetActionBar();
		} else {
			menu.style.display = 'block';
		}
		window.location.hash = '#';
	}
	function closeOverlay( ) {
		$( 'html' ).removeClass( 'overlay' );
		MobileFrontend.history.replaceHash( '#' );
	}

	function showOverlay() {
		$( 'html' ).addClass( 'overlay' );
		$( 'html' ).removeClass( 'navigationEnabled' );
	}

	function createOverlay( heading, contents ) {
		var overlay = document.getElementById( mfePrefix + 'overlay' );
		showOverlay();
		$( overlay ).empty();
		$( '<div class="header">' ).appendTo( '#' + mfePrefix + 'overlay' );
		$( '<button id="close"></button>' ).text( message( 'collapse-section' ) ).
			click( closeOverlay ).appendTo( '#' + mfePrefix + 'overlay' );
		$( '<h2>' ).text( heading ).appendTo( '#' + mfePrefix + 'overlay .header' );
		$( overlay ).append( contents );
		$( 'a', overlay.lastChild ).bind( 'click', function() {
			toggleActionBar();
		});
		MobileFrontend.history.pushState( '#mw-mf-overlay' );
	}

	function countContentHeadings() {
		return $( '.section h2 span' ).length;
	}

	function createTableOfContents() {
		var ul = $( '<ul />' )[0], li, a,
			click = function() {
				var hash = this.getAttribute( 'href' );
				MobileFrontend.toggle.wm_reveal_for_hash( hash );
				if( hash ) {
					window.location.hash = hash;
				}
				closeOverlay();
			};
		$( '.section h2 span' ).each( function( i, el ) {
			li = $( '<li />' ).appendTo( ul )[0];
			a = $( '<a />' ).attr( 'href', '#' + $( el ).attr( 'id' ) ).
				text( $( el ).text() ).bind( 'click', click).appendTo( li );
		} );
		createOverlay( message( 'contents-heading' ), ul );
	}

	function countAvailableLanguages() {
		return $( '#' + mfePrefix + 'language-selection option' ).length;
	}

	function createLanguagePage() {
		var ul = $( '<ul />' )[0], li, a,
			$languages = $( '#' + mfePrefix + 'language-selection option' );

		$( '<li />' ).addClass( 'mw-mf-language-header' ).
			text( message( 'mobile-frontend-language-header' ).replace( '$1', $languages.length ) ).appendTo( ul );
		$languages.each( function(i, el) {
			li = $( '<li />' ).appendTo( ul )[0];
			a = $( '<a />' ).attr( 'href', el.value ).text( $( el ).text() ).appendTo( li );
		} );
		createOverlay( message( 'language-heading' ), ul );
	}

	function init() {
		u( window ).bind( 'hashchange', function() {
			var hash = window.location.hash;
			if( hash === '#mw-mf-overlay' ) {
				showOverlay();
			} else if( !hash ) { // destroy overlay
				closeOverlay();
			}
		});
		$( '<div id="' + mfePrefix + 'overlay"></div>' ).appendTo( document.body );
		var search = document.getElementById(  mfePrefix + 'search' ),
			actionMenuButton = document.getElementById( mfePrefix + 'language' ),
			tocMenuButton = document.getElementById( mfePrefix + 'toc' );

		function toggleNavigation() {
			var doc = document.documentElement;
			var mwMfPageLeft = document.getElementById( 'mw-mf-page-left' );
			if( !u( doc ).hasClass( 'navigationEnabled' ) ) {
				mwMfPageLeft.style.display = 'block';
				u( doc ).addClass( 'navigationEnabled' );
			} else {
				u( doc ).removeClass( 'navigationEnabled' );
				mwMfPageLeft.style.display = 'none';
			}
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

		$( '#' + mfePrefix + 'page-menu-button' ).click( function( ev ) {
			ev.preventDefault();
			toggleActionBar();
		});

		if( countContentHeadings() > 0 ) {
			$( tocMenuButton ).bind( 'click', createTableOfContents );
		} else {
			$( tocMenuButton ).addClass( 'disabled' );
		}

		if( countAvailableLanguages() > 1 ) {
			$( actionMenuButton ).bind( 'click', createLanguagePage );
		} else {
			$( actionMenuButton ).addClass( 'disabled' );
		}

		u( search ).bind( 'focus', function() {
			u( document.documentElement ).removeClass( 'navigationEnabled' );
		} );
	}
	if( typeof(jQuery) !== 'undefined' ) {
		init();
	}
}());
