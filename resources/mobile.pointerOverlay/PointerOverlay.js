( function ( M, $ ) {
	var Overlay = M.require( 'mobile.startup/Overlay' );

	/**
	 * Page overlay prompting a user for given action
	 * @class PointerOverlay
	 * @extends Overlay
	 */
	function PointerOverlay() {
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
		template: mw.template.get( 'mobile.pointerOverlay', 'PointerOverlay.hogan' ),
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {string} defaults.isCompact whether the pointer overlay should be compact
		 * @cfg {number} defaults.timeout in milliseconds. If not zero the pointer overlay will
		 *  hide after this duration of time.
		 * @cfg {string} defaults.isTutorial whether the pointer overlay contains tutorial like instructions
		 * @cfg {string} defaults.summary Message describing thing being pointed to.
		 * @cfg {string} defaults.cancelMsg Cancel message.
		 * @cfg {string} defaults.appendToElement Where pointer overlay should be appended to.
		 * @cfg {string} defaults.target jQuery selector to point tutorial at
		 * @cfg {string} [defaults.alignment] Determines where the pointer should point to. Valid values 'left' or 'center'
		 * @cfg {string} [defaults.confirmMsg] Label for a confirm message.
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			summary: undefined,
			isCompact: false,
			isTutorial: false,
			timeout: 0,
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

			if ( this.options.isCompact ) {
				this.$el.addClass( 'pointer-overlay-compact' );
			}
			if ( this.options.isTutorial ) {
				this.$el.addClass( 'pointer-overlay-tutorial' );
			}
			if ( this.options.timeout ) {
				setTimeout( function () {
					self.hide();
				}, this.options.timeout );
			}
			if ( self.options.target ) {
				// FIXME: this option should be a jQuery object already. Avoid use of global $.
				$target = $( self.options.target );
				// Ensure we position the overlay correctly but do not show the arrow
				self._position( $target );
				this.addPointerArrow( $target );
			}
		},
		/**
		 * Refreshes the pointer arrow.
		 * @method
		 * @param {string} target jQuery selector
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
			var left,
				paOffset = $pa.offset(),
				h = $pa.outerHeight( true ),
				y = paOffset.top + h;

			this.$el.css( 'top', y );
			if ( this.options.autoHide ) {
				left = paOffset.left;
				this.$el.css( 'left', left );
			}
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
			left = 24;
			if ( !this.options.autoHide ) {
				left += paOffset.left - overlayOffset.left;
			}
			if ( this.alignment === 'center' ) {
				left -= center;
			}

			this.$pointer = $( '<div class="tutorial-pointer"></div>' ).css( {
				top: -6,
				left: left
			} ).appendTo( this.$el );

			// Since the positioning of this overlay is dependent on the current viewport it makes sense to
			// use a global window event so that on resizes it is correctly positioned.
			M.on(
				'resize',
				$.proxy( this, 'refreshPointerArrow', this.options.target )
			);
		}
	} );

	module.exports = PointerOverlay;

}( mw.mobileFrontend, jQuery ) );
