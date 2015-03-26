( function ( M, $ ) {

	var ContentOverlay,
		context = M.require( 'context' ),
		skin = M.require( 'skin' ),
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
		appendToElement: '#mw-mf-page-center',
		/** @inheritdoc */
		postRender: function ( options ) {
			var $target,
				self = this;

			Overlay.prototype.postRender.apply( this, arguments );
			if ( options.target ) {
				$target = $( options.target );
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
				y = paOffset.top;

			// We only care about this in a border-box world which is disabled in alpha.
			if ( !context.isAlphaGroupMember() ) {
				y += h;
			}

			this.$el.css( 'top', y );
		},
		/**
		 * Position overlay and add pointer arrow that points at specified element
		 * @method
		 * @param {jQuery.Object} $pa An element that should be pointed at by the overlay
		 */
		addPointerArrow: function ( $pa ) {
			var tb = 'solid 10px transparent',
				paOffset = $pa.offset(),
				overlayOffset = this.$el.offset(),
				center = $pa.width() / 2;

			this._position( $pa );
			this.$pointer = $( '<div>' ).css( {
				'border-bottom': 'solid 10px #2E76FF',
				'border-right': tb,
				'border-left': tb,
				position: 'absolute',
				top: -10,
				// Add half of the element width and subtract 10px for half of the arrow
				// remove the left offset of the overlay as margin auto may be applied to it
				left: paOffset.left + center - 10 - overlayOffset.left
			} ).appendTo( this.$el );
			skin.on( 'changed', $.proxy( this, 'refreshPointerArrow', this.options.target ) );
			M.on( 'resize', $.proxy( this, 'refreshPointerArrow', this.options.target ) );
		}
	} );
	M.define( 'modules/tutorials/ContentOverlay', ContentOverlay );

}( mw.mobileFrontend, jQuery ) );
