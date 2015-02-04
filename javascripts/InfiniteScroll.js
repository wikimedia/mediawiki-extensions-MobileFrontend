( function ( M, $ ) {

	var EventEmitter = M.require( 'eventemitter' ),
		InfiniteScroll;

	/**
	 * Class to assist a view in implementing infinite scrolling on some DOM
	 * element.
	 *
	 * @class InfiniteScroll
	 *
	 * Use this class in a view to help it do infinite scrolling.
	 *
	 * 1. Initialize it in the constructor `initialize` and listen to the 'load'
	 *   event it emits (and call your loading function then)
	 * 2. On preRender (once we have the dom element) set it into the infinite
	 *   scrolling object and disable it until we've loaded.
	 * 3. Once you have loaded the list and put it in the dom, enable the
	 *   infinite scrolling detection.
	 *   * Everytime the scroller detection triggers a load, it auto disables
	 *     to not trigger multiple times. After you have loaded, manually
	 *     re-enable it.
	 *
	 * Example:
	 *     @example
	 *     <code>
	 *       var InfiniteScroll = M.require( 'InfiniteScroll' ),
	 *         PhotoList;
	 *       PhotoList = View.extend( {
	 *         //...
	 *         initialize: function ( options ) {
	 *           this.api = new PhotoListApi( {
	 *             username: options.username
	 *           } );
	 *           // 1. Set up infinite scroll helper and listen to events
	 *           this.infiniteScroll = new InfiniteScroll( 1000 );
	 *           this.infiniteScroll.on( 'load', $.proxy( this, '_loadPhotos' ) );
	 *           View.prototype.initialize.apply( this, arguments );
	 *         },
	 *         preRender: function () {
	 *           // 2. Disable until we've got the list rendered and set DOM el
	 *           this.infiniteScroll.setElement( this.$el );
	 *           this.infiniteScroll.disable();
	 *         },
	 *         _loadPhotos: function () {
	 *           var self = this;
	 *           this.api.getPhotos().done( function ( photos ) {
	 *             // load photos into the DOM ...
	 *             // 3. and (re-)enable infinite scrolling
	 *             self.infiniteScroll.enable();
	 *           } );
	 *         }
	 *       } );
	 *     </code>
	 */
	InfiniteScroll = EventEmitter.extend( {
		/**
		 * Constructor.
		 * @param {Number} threshold distance in pixels used to calculate if scroll
		 * position is near the end of the $el
		 */
		initialize: function ( threshold ) {
			EventEmitter.prototype.initialize.apply( this, arguments );
			this.threshold = threshold || 100;
			this.enabled = true;
			this._bindScroll();
		},
		/**
		 * Listen to scroll on window and notify this._onScroll
		 * @method
		 * @private
		 */
		_bindScroll: function () {
			// FIXME: Consider using setInterval instead or some sort of
			// dethrottling/debouncing to avoid performance degradation
			// e.g. http://benalman.com/projects/jquery-throttle-debounce-plugin/
			$( window ).on( 'scroll', $.proxy( this, '_onScroll' ) );
		},
		/**
		 * Scroll handler. Triggers load event when near the end of the container.
		 * @method
		 * @private
		 */
		_onScroll: function () {
			if ( this.$el && this.enabled && this.scrollNearEnd() ) {
				// Disable when triggering an event. Won't trigger again until
				// re-enabled.
				this.disable();
				/**
				 * @event load
				 * Fired when scroll bottom has been reached to give oportunity to
				 * load to owners.
				 */
				this.emit( 'load' );
			}
		},
		/**
		 * Is the scroll position near the end of the container element?
		 * @method
		 * @private
		 * @return {Boolean}
		 */
		scrollNearEnd: function () {
			var scrollBottom = $( window ).scrollTop() + $( window ).height(),
				endPosition = this.$el.offset().top + this.$el.outerHeight();
			return scrollBottom + this.threshold > endPosition;
		},
		/**
		 * Enable the InfiniteScroll so that it triggers events.
		 * @method
		 */
		enable: function () {
			this.enabled = true;
		},
		/**
		 * Disable the InfiniteScroll so that it doesn't trigger events.
		 * @method
		 */
		disable: function () {
			this.enabled = false;
		},
		/**
		 * Set the element to compare to scroll position to
		 * @param {jQuery.Object} $el jQuery element where we want to listen for
		 * infinite scrolling.
		 */
		setElement: function ( $el ) {
			this.$el = $el;
		}
	} );

	M.define( 'InfiniteScroll', InfiniteScroll );
}( mw.mobileFrontend, jQuery ) );
