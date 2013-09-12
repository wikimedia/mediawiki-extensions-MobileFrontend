( function( M, $ ) {
	var Overlay = M.require( 'Overlay' ),
		LearnMoreOverlay = M.require( 'modules/uploads/LearnMoreOverlay' ),
		NagOverlay;

	NagOverlay = Overlay.extend( {
		defaults: {
			learnMore: mw.msg( 'parentheses', mw.msg( 'mobile-frontend-learn-more' ) )
		},

		template: M.template.get( 'uploads/NagOverlay' ),

		initialize: function( options ) {
			this.learnMoreOverlay = new LearnMoreOverlay( {
				parent: this,
				heading: mw.msg( 'mobile-frontend-photo-nag-learn-more-heading' ),
				bulletPoints: [
					mw.msg( 'mobile-frontend-photo-nag-learn-more-1' ),
					mw.msg( 'mobile-frontend-photo-nag-learn-more-2' ),
					mw.msg( 'mobile-frontend-photo-nag-learn-more-3' )
				]
			} );

			this._super( options );
		},

		postRender: function( options ) {
			var self = this, $checkboxes = this.$( 'input[type=checkbox]' );

			this._super( options );

			function disable( $checkbox ) {
				$checkbox.prop( 'disabled', true );
				$checkbox.parent().removeClass( 'active' );
			}

			function enable( $checkbox ) {
				$checkbox.prop( 'disabled', false );
				$checkbox.parent().addClass( 'active' );
			}

			self.$( 'li button' ).on( 'click', $.proxy( self.learnMoreOverlay, 'show' ) );

			disable( $checkboxes.not( ':first' ) );
			enable( $checkboxes.eq( 0 ) );

			$checkboxes.on( 'click', function() {
				var $checkbox = $( this ), $next;
				$checkbox.parent().addClass( 'checked' );
				$next = $checkboxes.not( ':checked' ).eq( 0 );
				disable( $checkbox );
				if ( !$next.length ) {
					self.hide();
					self.emit( 'confirm' );
				} else {
					enable( $next );
				}
			} );
		},

		setImageUrl: function( url ) {
			this.$( '.preview' ).
				removeClass( 'loading' ).
				css( 'background-image', 'url(' + url + ')' );
		}
	} );

	M.define( 'modules/uploads/NagOverlay', NagOverlay );

}( mw.mobileFrontend, jQuery ) );
