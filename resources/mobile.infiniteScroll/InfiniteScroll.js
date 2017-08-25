( function ( M ) {
	var util = M.require( 'mobile.startup/util' );

	/**
	 * Class to assist a view in implementing infinite scrolling on some DOM
	 * element.
	 *
	 * @class InfiniteScroll
	 * @mixins OO.EventEmitter
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
	 *       var InfiniteScroll = M.require( 'mobile.infiniteScroll/InfiniteScroll' );
	 *       OO.mfExtend( PhotoList, View, {
	 *         //...
	 *         initialize: function ( options ) {
	 *           this.gateway = new PhotoListGateway( {
	 *             username: options.username
	 *           } );
	 *           // 1. Set up infinite scroll helper and listen to events
	 *           this.infiniteScroll = new InfiniteScroll( 1000 );
	 *           this.infiniteScroll.on( 'load', this._loadPhotos.bind( this ) );
	 *           View.prototype.initialize.apply( this, arguments );
	 *         },
	 *         preRender: function () {
	 *           // 2. Disable until we've got the list rendered and set DOM el
	 *           this.infiniteScroll.setElement( this.$el );
	 *           this.infiniteScroll.disable();
	 *         },
	 *         _loadPhotos: function () {
	 *           var self = this;
	 *           this.gateway.getPhotos().done( function ( photos ) {
	 *             // load photos into the DOM ...
	 *             // 3. and (re-)enable infinite scrolling
	 *             self.infiniteScroll.enable();
	 *           } );
	 *         }
	 *       } );
	 *     </code>
	 */
	/**
	 * Constructor.
	 * @param {number} threshold distance in pixels used to calculate if scroll
	 * position is near the end of the $el
	 */
	function InfiniteScroll( threshold ) {
		this.threshold = threshold || 100;
		this.enable();
		OO.EventEmitter.call( this );
	}
	OO.mixinClass( InfiniteScroll, OO.EventEmitter );

	OO.mfExtend( InfiniteScroll, {
		/**
		 * Listen to scroll on window and notify this._onScroll
		 * @method
		 * @private
		 */
		_bindScroll: function () {
			if ( !this._scrollHandler ) {
				this._scrollHandler = this._onScroll.bind( this );
				M.on( 'scroll:throttled', this._scrollHandler );
			}
		},
		/**
		 * Unbind scroll handler
		 * @method
		 * @private
		 */
		_unbindScroll: function () {
			if ( this._scrollHandler ) {
				M.off( 'scroll:throttled', this._scrollHandler );
				this._scrollHandler = null;
			}
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
		 * @return {boolean}
		 */
		scrollNearEnd: function () {
			var $window = util.getWindow(),
				scrollBottom = $window.scrollTop() + $window.height(),
				endPosition = this.$el.offset().top + this.$el.outerHeight();
			return scrollBottom + this.threshold > endPosition;
		},
		/**
		 * Enable the InfiniteScroll so that it triggers events.
		 * @method
		 */
		enable: function () {
			this.enabled = true;
			this._bindScroll();
		},
		/**
		 * Disable the InfiniteScroll so that it doesn't trigger events.
		 * @method
		 */
		disable: function () {
			this.enabled = false;
			this._unbindScroll();
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

	M.define( 'mobile.infiniteScroll/InfiniteScroll', InfiniteScroll );
}( mw.mobileFrontend ) );
