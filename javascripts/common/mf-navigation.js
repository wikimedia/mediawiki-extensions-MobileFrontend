(function( M ) {

var m = ( function( $ ) {
	var View = M.require( 'view' ),
		u = M.utils, mfePrefix = M.prefix,
		inBeta = mw.config.get( 'wgMFMode' ) === 'beta',
		Overlay,
		OverlayManager,
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

	OverlayManager = function() {};

	OverlayManager.prototype = {
		stack: [],
		getTopOverlay: function() {
			return this.stack[ this.stack.length - 1 ];
		},
		pop: function() {
			var overlay = this.stack.pop(); // assume the overlay being escaped is the topmost one
			// Make sure all open overlays are closed before returning to article
			if ( this.stack.length === 0 ) {
				$( 'html' ).removeClass( 'overlay' );
				// return to last known scroll position
				window.scrollTo( document.body.scrollLeft, overlay.scrollTop );
				return true;
			} else {
				this.getTopOverlay().show();
				return false;
			}
		},
		push: function( overlay ) {
			// hide the current open overlay
			var top = this.getTopOverlay();
			if ( top ) {
				top.hide();
			}

			this.stack.push( overlay );
			$( 'html' ).addClass( 'overlay' ).
				removeClass( 'navigationEnabled' );

			// skip the URL bar if possible
			window.scrollTo( 0, 1 );
		}
	};

	Overlay = View.extend( {
		defaults: {
			heading: '',
			content: '',
			closeMsg: mw.msg( 'mobile-frontend-overlay-escape' )
		},
		template: M.template.get( 'overlay' ),
		className: 'mw-mf-overlay',
		initialize: function() {
			var self = this;
			this.isOpened = false;
			this.$( '.cancel' ).click( function( ev ) {
				ev.preventDefault();
				self.hide();
				self.isOpened = false;
				M.emit( 'overlay-closed' );
			} );
		},
		show: function() {
			this.$el.appendTo( 'body' );
			this.scrollTop = document.body.scrollTop;
			if ( !this.isOpened ) {
				this.isOpened = true;
				M.emit( 'overlay-opened', this );
			}
		},
		hide: function() {
			this.$el.detach();
		}
	} );

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
		var manager,
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
			$( 'html' ).addClass( 'navigationEnabled' );
		}

		function closeNavigation() {
			M.history.pushState( '#' );
			$( 'html' ).removeClass( 'navigationEnabled' );
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
		} ).on( 'touchend', function( ev ) {
			ev.stopPropagation();
		} );

		// close navigation if content tapped
		$( '#mw-mf-page-center' ).on( 'touchend', function() {
			if ( $( 'html' ).hasClass( 'navigationEnabled' ) ) {
				closeNavigation();
			}
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

		// events
		manager = new OverlayManager();
		M.on( 'overlay-opened', function( overlay ) {
			manager.push( overlay );
		} );
		M.on( 'overlay-closed', function() {
			manager.pop();
		} );
	}

	init();

	return {
		CtaDrawer: CtaDrawer,
		Overlay: Overlay,
		getPageMenu: getPageMenu
	};
}( jQuery ));

M.define( 'navigation', m );

}( mw.mobileFrontend ));
