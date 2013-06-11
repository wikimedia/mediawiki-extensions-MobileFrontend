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
		initialize: function( options ) {
			this.parent = options.parent;
			this.isOpened = false;
		},
		postRender: function() {
			var self = this;
			this.$( '.cancel,.confirm' ).click( function( ev ) {
				ev.preventDefault();
				self.hide();
			} );
		},
		show: function() {
			// FIXME: prevent zooming within overlays but don't break the rendering!
			// M.lockViewport();
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
			// FIXME: allow zooming outside the overlay again
			// M.unlockViewport();
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

M.define( 'Overlay', Overlay );

}( mw.mobileFrontend, jQuery ) );
