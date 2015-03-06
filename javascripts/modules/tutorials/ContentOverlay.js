( function ( M, $ ) {

	var ContentOverlay,
		Overlay = M.require( 'Overlay' );

	/**
	 * An {@link Overlay} that points at an element on the page.
	 * @class ContentOverlay
	 * @extends Overlay
	 */
	ContentOverlay = Overlay.extend( {
		/** @inheritdoc */
		templatePartials: {},
		className: 'overlay content-overlay',
		/**
		 * @inheritdoc
		 */
		fullScreen: false,
		/**
		 * @inheritdoc
		 */
		closeOnContentTap: true,
		/**
		 * @inheritdoc
		 */
		appendTo: '#mw-mf-page-center',
		/** @inheritdoc */
		postRender: function ( options ) {
			var self = this,
				$target,
				targetOffset,
				intervalID;

			Overlay.prototype.postRender.apply( this, arguments );
			if ( options.target ) {
				$target = $( options.target );
				targetOffset = $target.offset();
				self._position( $target );
				self.addPointerArrow( $target );
				// Listen to changes of the position of 'target' and reposition the overlay accordingly
				intervalID = setInterval( function () {
					var newOffset = $target.offset();
					if ( targetOffset.left !== newOffset.left || targetOffset.top !== newOffset.top ) {
						self._position( $target );
						self.refreshPointerArrow( options.target );
					}
				}, 1000 );
				// stop listening
				self.on( 'hide', function () {
					clearInterval( intervalID );
				} );
			}
		},
		/**
		 * Refreshes the pointer arrow.
		 * @method
		 * @param {String} target jQuery selector
		 */
		refreshPointerArrow: function ( target ) {
			this.$pointer.remove();
			this.addPointerArrow( $( target ) );
		},
		/**
		 * Position the overlay under a specified element
		 * @private
		 * @param {jQuery.Object} $pa An element that should be pointed at by the overlay
		 */
		_position: function ( $pa ) {
			var paOffset = $pa.offset(),
				h = $pa.outerHeight( true );

			this.$el.css( 'top', paOffset.top + h );
		},
		/**
		 * Position overlay and add pointer arrow that points at specified element
		 * @method
		 * @param {jQuery.Object} $pa An element that should be pointed at by the overlay
		 */
		addPointerArrow: function ( $pa ) {
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
