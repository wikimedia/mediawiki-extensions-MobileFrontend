( function ( M, $ ) {
	var Overlay = M.require( 'mobile.overlays/Overlay' );

	/**
	 * Page overlay prompting a user for given action
	 * @class PointerOverlay
	 * @extends Overlay
	 */
	function PointerOverlay( options ) {
		// FIXME: This should not have a default fallback. This is a non-optional parameter.
		// Remove when all existing uses in Gather have been updated.
		this.appendToElement = options.appendToElement || '#mw-mf-page-center';
		Overlay.apply( this, arguments );
	}

	OO.mfExtend( PointerOverlay, Overlay, {
		className: 'overlay pointer-overlay tutorial-overlay',
		/**
		 * @inheritdoc
		 */
		isBorderBox: false,
		/**
		 * @inheritdoc
		 */
		fullScreen: false,
		/**
		 * @inheritdoc
		 */
		closeOnContentTap: true,
		template: mw.template.get( 'mobile.contentOverlays', 'PointerOverlay.hogan' ),
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.summary Message describing thing being pointed to.
		 * @cfg {String} defaults.cancelMsg Cancel message.
		 * @cfg {String} defaults.appendToElement Where pointer overlay should be appended to.
		 * @cfg {String} defaults.target jQuery selector to point tutorial at
		 * @cfg {String} [defaults.alignment] Determines where the pointer should point to. Valid values 'left' or 'center'
		 * @cfg {String} [defaults.confirmMsg] Label for a confirm message.
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			summary: undefined,
			cancelMsg: mw.msg( 'mobile-frontend-pointer-dismiss' ),
			appendToElement: undefined,
			target: undefined,
			alignment: 'center',
			confirmMsg: undefined
		} ),
		/**
		 * @inheritdoc
		 */
		events: {
			'click .cancel': 'hide'
		},
		/** @inheritdoc */
		postRender: function () {
			var $target,
				self = this;

			Overlay.prototype.postRender.apply( this );
			if ( self.options.target ) {
				$target = $( self.options.target );
				// Ensure we position the overlay correctly but do not show the arrow
				self._position( $target );
				this.addPointerArrow( $target );
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
				h = $pa.outerHeight( true ),
				y = paOffset.top + h;

			this.$el.css( 'top', y );
		},
		/**
		 * Position overlay and add pointer arrow that points at specified element
		 * @method
		 * @param {jQuery.Object} $pa An element that should be pointed at by the overlay
		 */
		addPointerArrow: function ( $pa ) {
			var left,
				paOffset = $pa.offset(),
				overlayOffset = this.$el.offset(),
				center = $pa.width() / 2;

			this._position( $pa );
			// add the entire width of the pointer
			left = paOffset.left + 20 - overlayOffset.left;
			if ( this.alignment === 'center' ) {
				left -= center;
			}

			this.$pointer = $( '<div class="tutorial-pointer"></div>' ).css( {
				top: -10,
				left: left
			} ).appendTo( this.$el );

			// Since the positioning of this overlay is dependent on the current viewport it makes sense to
			// use a global window event so that on resizes it is correctly positioned.
			$( window )
				.on( 'resize', $.debounce( 100, $.proxy( this, 'refreshPointerArrow', this.options.target ) ) );
		}
	} );

	M.define( 'mobile.contentOverlays/PointerOverlay', PointerOverlay );

}( mw.mobileFrontend, jQuery ) );
