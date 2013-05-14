(function( M ) {

var m = ( function( $ ) {
	var View = M.require( 'view' ),
		menu,
		mfePrefix = M.prefix,
		inBeta = mw.config.get( 'wgMFMode' ) === 'beta',
		Overlay,
		Drawer, CtaDrawer;

	Drawer = View.extend( {
		defaults: {
			cancelMessage: M.message( 'mobile-frontend-drawer-cancel' )
		},
		className: 'drawer position-fixed',

		initialize: function() {
			var self = this;
			this.$( '.close' ).click( function( ev ) {
				ev.preventDefault();
				self.hide();
			} );
			$( window ).on( 'scroll click', function() {
				self.hide();
			} );
			this.appendTo( '#mw-mf-page-center' );
		},

		show: function() {
			this.$el.addClass( 'visible' );
		},

		hide: function() {
			this.$el.removeClass( 'visible' );
		},

		isVisible: function() {
			return this.$el.hasClass( 'visible' );
		}
	} );

	CtaDrawer = Drawer.extend( {
		defaults: {
			loginCaption: mw.msg( 'mobile-frontend-watchlist-cta-button-login' ),
			signupCaption: mw.msg( 'mobile-frontend-watchlist-cta-button-signup' ),
			cancelMessage: mw.msg( 'mobile-frontend-drawer-cancel' )
		},
		template: M.template.get( 'ctaDrawer' ),

		preRender: function( options ) {
			var params = {
				returnto: mw.config.get( 'wgTitle' ),
				returntoquery: options.returnToQuery
			};

			options.loginUrl = M.history.getArticleUrl( 'Special:UserLogin', params );
			options.signupUrl = M.history.getArticleUrl( 'Special:UserLogin', $.extend( params, { type: 'signup' } ) );
		}
	} );

	Overlay = View.extend( {
		defaults: {
			heading: '',
			content: '',
			closeMsg: mw.msg( 'mobile-frontend-overlay-escape' )
		},
		parent: null,
		template: M.template.get( 'overlay' ),
		className: 'mw-mf-overlay',
		initialize: function( options ) {
			var self = this;
			this.parent = options.parent;
			this.isOpened = false;
			this.$( '.cancel,.confirm' ).click( function( ev ) {
				ev.preventDefault();
				self.hide();
			} );
		},
		show: function() {
			if ( this.parent ) {
				this.parent.hide();
			}
			this.$el.appendTo( 'body' );
			this.scrollTop = document.body.scrollTop;
			$( 'html' ).addClass( 'overlay' );
			$( 'body' ).removeClass( 'navigation-enabled' );

			// skip the URL bar if possible
			window.scrollTo( 0, 1 );
		},
		hide: function() {
			this.$el.detach();
			if ( !this.parent ) {
				$( 'html' ).removeClass( 'overlay' );
				// return to last known scroll position
				window.scrollTo( document.body.scrollLeft, this.scrollTop );
			} else {
				this.parent.show();
			}
		}
	} );

	function getPageMenu() {
		return $( '#mw-mf-menu-page' );
	}

	function enableEditing( title ) {
		$( '#mw-mf-edit-page-link' ).remove();
		if ( title &&
			( mw.config.get( 'wgMFAnonymousEditing' ) || mw.config.get( 'wgUserName' ) ) &&
			mw.config.get( 'wgIsPageEditable' ) && // user is allowed to edit
			mw.util.getParamValue( 'action' ) !== 'edit' ) {
			$( '<a id="mw-mf-edit-page-link">' ).text( 'edit' ).attr( 'href',
				M.history.getArticleUrl( title, { action: 'edit' } ) ).
				prependTo( '#content' );
		}
	}

	function init() {
		var
			search = document.getElementById(  'searchInput' );

		$( '#mw-mf-menu-main a' ).click( function() {
			toggleNavigation(); // close before following link so that certain browsers on back don't show menu open
		} );

		if ( mw.config.get( 'wgMFMode' ) !== 'stable' ) {
			enableEditing( mw.config.get( 'wgTitle' ) );
			M.on( 'page-loaded', function( curPage ) {
				enableEditing( curPage.title );
			} );
		}

		function openNavigation() {
			$( 'body' ).addClass( 'navigation-enabled' );
		}

		function closeNavigation() {
			$( 'body' ).removeClass( 'navigation-enabled' );
		}

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
		return {
			close: closeNavigation,
			open: openNavigation
		};
	}

	menu = init();

	return {
		CtaDrawer: CtaDrawer,
		Overlay: Overlay,
		getPageMenu: getPageMenu,
		getMenu: menu
	};
}( jQuery ));

M.define( 'navigation', m );

}( mw.mobileFrontend ));
