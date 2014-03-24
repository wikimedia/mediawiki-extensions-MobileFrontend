( function( M, $ ) {

	var Overlay = M.require( 'Overlay' ), ContentOverlay;

	/**
	 * An {@link Overlay} that points at an element on the page.
	 * @class ContentOverlay
	 * @extends Overlay
	 */
	ContentOverlay = Overlay.extend( {
		className: 'content-overlay',
		/**
		 * @type Boolean
		 */
		fullScreen: false,
		/**
		 * @type Boolean
		 */
		closeOnContentTap: true,
		/**
		 * @type String
		 */
		appendTo: '#mw-mf-page-center',
		postRender: function( options ) {
			var self = this, $target;
			this._super( options );
			if ( options.target ) {
				$target = $( options.target );
				// Ensure we position the overlay correctly but do not show the arrow
				self._position( $target );
				// Ensure that any reflows due to tablet styles have happened before showing
				// the arrow.
				setTimeout( function() {
					self.addPointerArrow( $target );
					M.on( 'resize', $.proxy( self, 'refreshPointerArrow', options.target ) );
				}, 0 );
			}
		},
		/**
		 * Refreshes the pointer arrow.
		 * @method
		 */
		refreshPointerArrow: function( target ) {
			this.$pointer.remove();
			this.addPointerArrow( $( target ) );
		},
		/**
		 * @param {jQuery.Object} $pa An element that should be pointed at by the overlay
		 */
		_position: function( $pa ) {
			var paOffset = $pa.offset(),
				h = $pa.outerHeight( true );

			this.$el.css( 'top', paOffset.top + h );
		},
		/**
		 * @method
		 * @param {jQuery.Object} $pa An element that should be pointed at by the overlay
		 */
		addPointerArrow: function( $pa ) {
			var tb = 'solid 10px transparent',
				paOffset = $pa.offset(),
				overlayOffset = this.$el.offset();

			this._position( $pa );
			this.$pointer = $( '<div>' ).css( {
				'border-bottom': 'solid 10px #006398',
				'border-right': tb,
				'border-left': tb,
				position: 'absolute',
				top: -10,
				// remove the left offset of the overlay as margin auto may be applied to it
				left: paOffset.left + 10 - overlayOffset.left
			} ).appendTo( this.$el );
		}
	} );
	M.define( 'modules/tutorials/ContentOverlay', ContentOverlay );

}( mw.mobileFrontend, jQuery ) );
