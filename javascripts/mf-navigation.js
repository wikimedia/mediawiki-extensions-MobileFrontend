/*global document, window, MobileFrontend, navigator, placeholder */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
MobileFrontend.navigation = (function() {
	var u = MobileFrontend.utils, mfePrefix = MobileFrontend.prefix,
		message = MobileFrontend.message;

	function closeOverlay( ) {
		$( '#' + mfePrefix + 'overlay' ).empty();
		$( 'html' ).removeClass( 'overlay' );
	}

	function createOverlay( heading, contents ) {
		$( 'html' ).addClass( 'overlay' );
		$( '<div class="header">' ).appendTo( '#' + mfePrefix + 'overlay' );
		$( '<button id="close"></button>' ).text( message( 'collapse-section' ) ).
			click( closeOverlay ).appendTo( '#' + mfePrefix + 'overlay' );
		$( '<h2>' ).text( heading ).appendTo( '#' + mfePrefix + 'overlay .header' );
		$( '#' + mfePrefix + 'overlay' ).append( contents );
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

	function createLanguagePage() {
		var ul = $( '<ul />' )[0], li, a;

		$( '#' + mfePrefix + 'language-selection option' ).each( function(i, el) {
			li = $( '<li />' ).appendTo( ul )[0];
			a = $( '<a />' ).attr( 'href', el.value ).text( $( el ).text() ).appendTo( li );
		} );
		createOverlay( message( 'language-heading' ), ul );
	}

	function init() {
		$( '<div id="' + mfePrefix + 'overlay"></div>' ).appendTo( document.body );
		var search = document.getElementById(  mfePrefix + 'search' );

		function toggleNavigation() {
			if( !u( document.body ).hasClass( 'navigationEnabled' ) ) {
				u( document.body ).addClass( 'navigationEnabled' );
			} else {
				u( document.body ).removeClass( 'navigationEnabled' );
			}
		}
		$( '#' + mfePrefix + 'main-menu-button' ).click( function( ev ) {
			toggleNavigation();
			ev.stopPropagation();
		} );

		if( window.location.hash === '#mw-mf-page-left' ) {
			u( document.body ).addClass( 'noTransitions' );
			toggleNavigation();
			window.setTimeout( function() {
				u( document.body ).removeClass( 'noTransitions' );
			}, 1000 );
		}

		$( '#' + mfePrefix + 'page-menu-button' ).click( function( ev ) {
			ev.preventDefault();
			var menu = $( '#' + mfePrefix + 'nav' )[0];
			if( menu.style.display ) {
				menu.style.display = '';
			} else {
				menu.style.display = 'block';
			}
			window.location.hash = '#';
		});

		$( '#' + mfePrefix + 'toc' ).click( createTableOfContents );
		$( '#' + mfePrefix + 'language' ).click( createLanguagePage );

		u( search ).bind( 'focus', function() {
			u( document.body ).removeClass( 'navigationEnabled' );
		} );
	}
	if( typeof(jQuery) !== 'undefined' ) {
		init();
	}
}());
