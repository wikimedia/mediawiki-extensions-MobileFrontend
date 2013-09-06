( function( M, $ ) {

var View = M.require( 'view' ),
	Overlay = View.extend( {
		defaults: {
			heading: '',
			content: '',
			closeMsg: mw.msg( 'mobile-frontend-overlay-escape' )
		},
		template: M.template.get( 'overlay' ),
		className: 'mw-mf-overlay',
		closeOnBack: false,
		// use '#mw-mf-viewport' rather than 'body' - for some reasons this has
		// odd consequences on Opera Mobile (see bug 52361)
		appendTo: '#mw-mf-viewport',
		initialize: function( options ) {
			var self = this;
			options = options || {};
			this.parent = options.parent;
			this.isOpened = false;

			function hideOnRoute() {
				M.router.one( 'route', function( ev ) {
					if ( !self.hide() ) {
						ev.preventDefault();
						hideOnRoute();
					}
				} );
			}

			if ( this.closeOnBack ) {
				hideOnRoute();
			}

			this._super( options );
		},
		postRender: function() {
			var self = this;
			// FIXME change when micro.tap.js in stable
			this.$( '.cancel, .confirm' ).on( M.tapEvent( 'click' ), function( ev ) {
				ev.preventDefault();
				ev.stopPropagation();
				if ( self.closeOnBack ) {
					window.history.back();
				} else {
					self.hide();
				}
			} );
		},
		show: function() {
			// FIXME: prevent zooming within overlays but don't break the rendering!
			// M.lockViewport();
			if ( this.parent ) {
				this.parent.hide();
			}
			this.$el.appendTo( this.appendTo );
			this.scrollTop = document.body.scrollTop;
			$( 'html' ).addClass( 'overlay-enabled' );
			$( 'body' ).removeClass( 'navigation-enabled' );

			// skip the URL bar if possible
			window.scrollTo( 0, 1 );
		},
		hide: function() {
			// FIXME: allow zooming outside the overlay again
			// M.unlockViewport();
			this.$el.detach();
			if ( !this.parent ) {
				$( 'html' ).removeClass( 'overlay-enabled' );
				// return to last known scroll position
				window.scrollTo( document.body.scrollLeft, this.scrollTop );
			} else {
				this.parent.show();
			}
			return true;
		}
	} );

M.define( 'Overlay', Overlay );

}( mw.mobileFrontend, jQuery ) );
