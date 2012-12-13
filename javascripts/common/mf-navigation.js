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
		$( '<div class="header">' ).appendTo( '#' + mfePrefix + 'overlay' );
		$( '<button id="close"></button>' ).text( message( 'collapse-section' ) ).
			addClass( 'escapeOverlay' ).
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
		return overlay;
	}

	function enableArticleActions() {
		$( '<div id="mw-mf-menu-page">' ).appendTo( '#mw-mf-header' );
		$( 'html' ).addClass( 'hasSecondaryNav' );
	}

	function getPageMenu() {
		return $( '#mw-mf-menu-page' )[ 0 ];
	}

	function enableEditing( title ) {
		$( '#mw-mf-edit-page-link' ).remove();
		if ( title &&
				title.indexOf( ':' ) === -1 && // FIXME: hack
				M.getConfig( 'action' ) !== 'edit' ) {
			$( '<a id="mw-mf-edit-page-link">' ).text( 'edit' ).attr( 'href',
				M.getConfig( 'pageUrl' ).replace( '$1', title + '?action=edit' ) ).
				prependTo( '#content' );
		}
	}

	function init() {
		var id = mfePrefix + 'overlay',
			search = document.getElementById(  mfePrefix + 'search' );

		$( '#mw-mf-menu-main a' ).click( function() {
			toggleNavigation(); // close before following link so that certain browsers on back don't show menu open
		} );

		if ( M.getConfig( 'beta' ) ) {
			enableArticleActions();

			$( window ).bind( 'mw-mf-page-loaded', function( ev, curPage ) {
				M.getToken( 'edit', function( data ) {
					if( data.tokens && !data.warnings &&
							data.tokens.edittoken !== '+\\' ) { // then user is logged in
						enableEditing( curPage.title );
					}
				} );
			} );
		}

		$( window ).bind( 'mw-mf-history-change', function( ev, curPage ) {
			if ( curPage.hash === '#' || curPage.hash === '' ) {
				closeOverlay();
			}
		} );
		if ( !document.getElementById( id ) ) {
			$( '<div>' ).attr( 'id', id ).appendTo( document.body );
		}

		function toggleNavigation() {
			var doc = document.documentElement;
			if( !u( doc ).hasClass( 'navigationEnabled' ) ) {
				u( doc ).addClass( 'navigationEnabled' );
			} else {
				u( doc ).removeClass( 'navigationEnabled' );
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

		u( search ).bind( 'focus', function() {
			if ( !M.getConfig( 'beta' ) || $( window ).width() < 700 ) {
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
		showOverlay: showOverlay
	};
}( jQuery ));
}( mw.mobileFrontend ));
