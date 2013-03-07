(function( M ) {

var m = ( function( $ ) {
	var View = M.require( 'view' ),
		u = M.utils, mfePrefix = M.prefix,
		lastScrollTopPosition = 0,
		inBeta = mw.config.get( 'wgMFMode' ) === 'beta',
		Drawer, CtaDrawer;

	Drawer = View.extend( {
		defaults: {
			cancelMessage: M.message( 'mobile-frontend-drawer-cancel' )
		},
		className: 'drawer position-fixed-element',

		initialize: function() {
			var self = this;
			this.$( '.close' ).click( function( ev ) {
				ev.preventDefault();
				self.hide();
			} );
			$( window ).on( 'scroll click', function() {
				self.hide();
			} );
		},

		show: function() {
			this.appendTo( '#mw-mf-page-center' );
		},

		hide: function() {
			this.detach();
		},

		isVisible: function() {
			return this.$el.is( ':visible' );
		}
	} );

	CtaDrawer = Drawer.extend( {
		defaults: {
			loginCaption: mw.msg( 'mobile-frontend-watchlist-cta-button-login' ),
			loginUrl: M.history.getArticleUrl( 'Special:UserLogin', {
				returnto: mw.config.get( 'wgTitle' ),
				returntoquery: 'article_action=watch'
			} ),
			signupCaption: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' ),
			signupUrl: M.history.getArticleUrl( 'Special:UserLogin', {
				returnto: mw.config.get( 'wgTitle' ),
				returntoquery: 'article_action=watch',
				type: 'signup'
			} ),
			cancelMessage: mw.msg( 'mobile-frontend-drawer-cancel' )
		},
		template: M.template.get( 'ctaDrawer' )
	} );

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

	function init() {
		var id = mfePrefix + 'overlay',
			search = document.getElementById(  mfePrefix + 'search' );

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
		} );

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
		CtaDrawer: CtaDrawer,
		closeOverlay: closeOverlay,
		createOverlay: createOverlay,
		getPageMenu: getPageMenu,
		getOverlay: getOverlay,
		showOverlay: showOverlay
	};
}( jQuery ));

M.define( 'navigation', m );

}( mw.mobileFrontend ));
