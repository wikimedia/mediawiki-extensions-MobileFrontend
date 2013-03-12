(function( M ) {

var m = ( function( $ ) {
	var u = M.utils, mfePrefix = M.prefix,
		lastScrollTopPosition = 0,
		$drawer,
		inBeta = mw.config.get( 'wgMFMode' ) === 'beta';

	function getOverlay() {
		return document.getElementById( 'mw-mf-overlay' );
	}

	function closeOverlay( ) {
		$( 'html' ).removeClass( 'overlay' );
		window.scrollTo( document.body.scrollLeft, lastScrollTopPosition );
		M.history.replaceHash( '#' );
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
		$( '<div class="header">' ).appendTo( '#' + mfePrefix + 'overlay' );
		$( '<button id="close"></button>' ).text( mw.msg( 'mobile-frontend-overlay-escape' ) ).
			addClass( 'escapeOverlay' ).
			click( closeOverlay ).appendTo( '#' + mfePrefix + 'overlay .header' );
		if( typeof heading === 'string' ) {
			heading = $( '<h2 />' ).text( heading );
		}
		$( heading ).appendTo( '#' + mfePrefix + 'overlay .header' );
		$( overlay ).append( contents );

		return overlay;
	}

	function getPageMenu() {
		return $( '#mw-mf-menu-page' )[ 0 ];
	}

	function enableEditing( title ) {
		$( '#mw-mf-edit-page-link' ).remove();
		if ( title &&
			mw.config.get( 'wgUserName' ) && // FIXME: currently only shown for users
			mw.config.get( 'wgIsPageEditable' ) && // user is allowed to edit
			mw.util.getParamValue( 'action' ) !== 'edit' ) {
			$( '<a id="mw-mf-edit-page-link">' ).text( 'edit' ).attr( 'href',
				M.history.getArticleUrl( title, { action: 'edit' } ) ).
				prependTo( '#content' );
		}
	}

	function showDrawer() {
		$drawer.show();
		return $drawer.find( 'div' ).empty();
	}

	function makeDrawer() {
		$drawer = $( '<div id="mw-mf-drawer">' ).hide().appendTo( '#mw-mf-page-center' );
		$( '<div>' ).appendTo( $drawer );
		$( '<a class="close">' ).text( mw.msg( 'mobile-frontend-drawer-cancel' ) ).on( 'click', function() {
			$drawer.hide();
			} ).appendTo( $drawer );
	}

	function init() {
		var id = mfePrefix + 'overlay',
			search = document.getElementById(  mfePrefix + 'search' );

		makeDrawer();
		$( '#mw-mf-menu-main a' ).click( function() {
			toggleNavigation(); // close before following link so that certain browsers on back don't show menu open
		} );

		if ( M.history.isDynamicPageLoadEnabled ) {
			M.on( 'page-loaded', function( curPage ) {
				enableEditing( curPage.title );
			} );
		} else {
			enableEditing( mw.config.get( 'wgTitle' ) );
		}

		function openNavigation() {
			M.history.pushState( '#mw-mf-page-left' );
			$( 'html' ).addClass( 'navigationEnabled' );
		}

		function closeNavigation() {
			M.history.pushState( '#' );
			$( 'html' ).removeClass( 'navigationEnabled' );
		}

		M.on( 'history-change', function( curPage ) {
			if ( curPage.hash === '#' || curPage.hash === '' || curPage.hash === '#_' ) {
				closeOverlay();
				closeNavigation();
			} else if ( curPage.hash === '#mw-mf-page-left' ) {
				toggleNavigation();
			}
		} );
		if ( !document.getElementById( id ) ) {
			$( '<div>' ).attr( 'id', id ).appendTo( document.body );
		}

		function toggleNavigation() {
			var $html = $( 'html' );
			if( !$html.hasClass( 'navigationEnabled' ) ) {
				openNavigation();
			} else {
				closeNavigation();
			}
		}
		$( '#' + mfePrefix + 'main-menu-button' ).click( function( ev ) {
			toggleNavigation();
			ev.preventDefault();
			ev.stopPropagation();
		} );

		// close navigation if content tapped
		$( '#mw-mf-page-center' ).on( 'touchend', closeNavigation );

		if( window.location.hash === '#mw-mf-page-left' ) {
			openNavigation();
			u( document.body ).addClass( 'noTransitions' );
			window.setTimeout( function() {
				u( document.body ).removeClass( 'noTransitions' );
			}, 1000 );
		}

		u( search ).bind( 'focus', function() {
			if ( !inBeta || $( window ).width() < 700 ) {
				u( document.documentElement ).removeClass( 'navigationEnabled' );
			}
		} );
	}

	init();

	return {
		closeOverlay: closeOverlay,
		createOverlay: createOverlay,
		getPageMenu: getPageMenu,
		getOverlay: getOverlay,
		showDrawer: showDrawer,
		showOverlay: showOverlay
	};
}( jQuery ));

M.define( 'navigation', m );

}( mw.mobileFrontend ));
