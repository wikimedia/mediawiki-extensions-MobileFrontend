( function ( M, $ ) {

	var EventEmitter = M.require( 'eventemitter' ),
		Swipe;

	/**
	 * Class to assist a view in implementing swipe gestures on a specific element
	 *
	 * @class Swipe
	 *
	 * Use this class in a view to help it do things on swipe gestures.
	 *
	 * 1. Initialize it in the constructor `initialize` and listen to the
	 *   'swipe-{up|right|down|left}' events it emits (and do what you want to do)
	 * 2. On postRender (once we have the dom element) set it into the swipe
	 *   object.
	 * 3. If you want to disable Swipe (so no events are emitted anymore), use Swipe.disable()
	 *
	 * Example:
	 *     @example
	 *     <code>
	 *       var Swipe = M.require( 'Swipe' ),
	 *         ImageOverlay = M.require( 'modules/mediaViewer/ImageOverlay' ),
	 *         ImageOverlayNew;
	 *       ImageOverlayNew = ImageOverlay.extend( {
	 *         //...
	 *         initialize: function ( options ) {
	 *           var self = this;
	 *           this.swipe = new Swipe();
	 *           this.swipe
	 *             .on( 'swipe-right', function () {
	 *               self.setNewImage( $( '.slider-button.prev' ).data( 'thumbnail' ) );
	 *             } )
	 *             .on( 'swipe-left', function () {
	 *               self.setNewImage( $( '.slider-button.next' ).data( 'thumbnail' ) );
	 *             } );
	 *           ImageOverlay.prototype.initialize.apply( this, arguments );
	 *         },
	 *         postRender: function () {
	 *           if ( thumbs.length < 2 ) {
	 *             this.$( '.prev, .next' ).remove();
	 *             this.swipe.disable();
	 *           } else {
	 *             this.swipe.setElement( this.$el );
	 *             // identify last thumbnail
	 *             // ...
	 *           }
	 *         },
	 *       } );
	 *     </code>
	 */
	Swipe = EventEmitter.extend( {
		/**
		 * Constructor.
		 * @param {Number} minDistance minimal distance in pixel between touchstart and touchend
		 * to be recognized as a swipe event. Default: 200
		 */
		initialize: function ( minDistance ) {
			EventEmitter.prototype.initialize.apply( this, arguments );
			this.minDistance = minDistance || 200;
		},
		/**
		 * Listen to touchstart/touchend (swipe) gesture on $el
		 * @method
		 * @private
		 */
		_bindTouchEvents: function () {
			// bind touchstart and touchend events to $el
			$( this.$el )
				.on( 'touchstart.mfswipe', $.proxy( this, '_onTouchStart' ) )
				.on( 'touchend.mfswipe', $.proxy( this, '_onTouchEnd' ) );
		},
		/**
		 * Remove events from $el
		 * @method
		 * @private
		 */
		_unbindTouchEvents: function () {
			$( this.$el )
				.off( 'touchstart.mfswipe' )
				.off( 'touchend.mfswipe' );
		},
		/**
		 * Event handler for swipe start event (touchstart)
		 * @param {jQuery.Event} ev
		 */
		_onTouchStart: function ( ev ) {
			this.startTouch = ev.originalEvent.changedTouches[0];
		},
		/**
		 * Event handler for swipe finished event (touchend)
		 * @param {jQuery.Event} ev
		 */
		_onTouchEnd: function ( ev ) {
			this.endTouch = ev.originalEvent.changedTouches[0];
			// check if a swipe gesture is "long" enough

			// horizontal swipe
			if ( Math.abs( this.startTouch.pageX - this.endTouch.pageX ) > this.minDistance ) {
				// recognize the swipe direction
				if ( this.startTouch.pageX < this.endTouch.pageX ) {
					// swiped to the right side
					this.emit( 'swipe-right', ev );
				} else {
					// otherwise to the left side
					this.emit( 'swipe-left', ev );
				}
			}
			// vertical swipe
			if ( Math.abs( this.startTouch.pageY - this.endTouch.pageY ) > this.minDistance ) {
				// select the correct direction for the next image
				if ( this.startTouch.pageY < this.endTouch.pageY ) {
					// swiped up
					this.emit( 'swipe-up', ev );
				} else {
					// swiped down
					this.emit( 'swipe-down', ev );
				}
			}
		},
		/**
		 * Set the element where swipe gestures should be recognized
		 * @param {jQuery.Object} $el jQuery element where we want to listen for swipe
		 * gestures.
		 */
		setElement: function ( $el ) {
			// unbind all events from the old element
			this._unbindTouchEvents();
			// set the new element
			this.$el = $el;
			// bind events to the new element
			this._bindTouchEvents();
		},
		/**
		 * Disable swipe so that it doesn't trigger events.
		 * @method
		 */
		disable: function () {
			// unbind events from the element disables swipe
			this._unbindTouchEvents();
		}
	} );

	M.define( 'Swipe', Swipe );
}( mw.mobileFrontend, jQuery ) );
