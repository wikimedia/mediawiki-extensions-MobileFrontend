( function( M, $ ) {

	var Overlay = M.require( 'Overlay' ), ContentOverlay;

	/**
	 * An {@link Overlay} that points at an element on the page.
	 * @name ContentOverlay
	 * @class
	 * @extends Overlay
	 */
	ContentOverlay = Overlay.extend( {
		/**
		 * @name ContentOverlay.prototype.fullScreen
		 * @type Boolean
		 */
		fullScreen: false,
		/**
		 * @name ContentOverlay.prototype.closeOnContentTap
		 * @type Boolean
		 */
		closeOnContentTap: true,
		/**
		 * @name ContentOverlay.prototype.appendTo
		 * @type String
		 */
		appendTo: '#mw-mf-page-center',
		postRender: function( options ) {
			this._super( options );
			if ( options.target ) {
				this.addPointerArrow( $( options.target ) );
			}
		},
		/**
		 * @name ContentOverlay.prototype.addPointerArrow
		 * @function
		 * @param {jQuery.Object} $pa An element that should be pointed at by the overlay
		 */
		addPointerArrow: function( $pa ) {
			var tb = 'solid 10px transparent',
				paOffset = $pa.offset(),
				h = $pa.outerHeight( true );

			this.$el.css( 'top', paOffset.top + h );
			$( '<div>' ).css( {
				'border-bottom': 'solid 10px #006398',
				'border-right': tb,
				'border-left': tb,
				position: 'absolute',
				top: -10,
				left: paOffset.left + 10
			} ).appendTo( this.$el );
		}
	} );
	M.define( 'ContentOverlay', ContentOverlay );

}( mw.mobileFrontend, jQuery ) );
