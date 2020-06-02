var util = require( './util' ),
	mfExtend = require( './mfExtend' );

/**
 * Class to assist a view in implementing infinite scrolling on some DOM
 * element. This module itself is only responsible for emitting an Event when
 * the bottom of an Element is scrolled to.
 *
 * @class ScrollEndEventEmitter
 * @mixins OO.EventEmitter
 *
 * Use this class in a view to help it do infinite scrolling.
 *
 * 1. Initialize it in the constructor `initialize` and listen to the
 *   EVENT_SCROLL_END event it emits (and call your loading function then)
 * 2. On preRender (once we have the DOM element) set it into the infinite
 *   scrolling object and disable it until we've loaded.
 * 3. Once you have loaded the list and put it in the DOM, enable the
 *   infinite scrolling detection.
 *   * Everytime the scroller detection triggers a load, it auto disables
 *     to not trigger multiple times. After you have loaded, manually
 *     re-enable it.
 *
 * Example:
 *     @example
 *     <code>
 *       var
 *         mfExtend = require( './mfExtend' ),
 *         ScrollEndEventEmitter = require( './ScrollEndEventEmitter' ),
 *         eventBus = require( './eventBusSingleton' );
 *       mfExtend( PhotoList, View, {
 *         //...
 *         initialize: function ( options ) {
 *           this.gateway = new PhotoListGateway( {
 *             username: options.username
 *           } );
 *           // 1. Set up infinite scroll helper and listen to events
 *           this.scrollEndEventEmitter = new ScrollEndEventEmitter( eventBus, 1000 );
 *           this.scrollEndEventEmitter.on( ScrollEndEventEmitter.EVENT_SCROLL_END,
 *             this._loadPhotos.bind( this ) );
 *           View.prototype.initialize.apply( this, arguments );
 *         },
 *         preRender: function () {
 *           // 2. Disable until we've got the list rendered and set DOM el
 *           this.scrollEndEventEmitter.setElement( this.$el );
 *           this.scrollEndEventEmitter.disable();
 *         },
 *         _loadPhotos: function () {
 *           var self = this;
 *           this.gateway.getPhotos().then( function ( photos ) {
 *             // load photos into the DOM ...
 *             // 3. and (re-)enable infinite scrolling
 *             self.scrollEndEventEmitter.enable();
 *           } );
 *         }
 *       } );
 *     </code>
 *
 * @fires ScrollEndEventEmitter#ScrollEndEventEmitter-scrollEnd
 * @param {Object} eventBus object to listen for scroll:throttled events
 * @param {number} [threshold=100] distance in pixels used to calculate if scroll
 * position is near the end of the $el
 */
function ScrollEndEventEmitter( eventBus, threshold ) {
	this.threshold = threshold || 100;
	this.eventBus = eventBus;
	this.enable();
	OO.EventEmitter.call( this );
}
OO.mixinClass( ScrollEndEventEmitter, OO.EventEmitter );

/**
 * Fired when scroll bottom has been reached.
 *
 * @event ScrollEndEventEmitter#ScrollEndEventEmitter-scrollEnd
 */
ScrollEndEventEmitter.EVENT_SCROLL_END = 'ScrollEndEventEmitter-scrollEnd';

mfExtend( ScrollEndEventEmitter, {
	/**
	 * Listen to scroll on window and notify this._onScroll
	 *
	 * @memberof ScrollEndEventEmitter
	 * @instance
	 * @private
	 */
	_bindScroll: function () {
		if ( !this._scrollHandler ) {
			this._scrollHandler = this._onScroll.bind( this );
			this.eventBus.on( 'scroll:throttled', this._scrollHandler );
		}
	},
	/**
	 * Unbind scroll handler
	 *
	 * @memberof ScrollEndEventEmitter
	 * @instance
	 * @private
	 */
	_unbindScroll: function () {
		if ( this._scrollHandler ) {
			this.eventBus.off( 'scroll:throttled', this._scrollHandler );
			this._scrollHandler = null;
		}
	},
	/**
	 * Scroll handler. Triggers load event when near the end of the container.
	 *
	 * @memberof ScrollEndEventEmitter
	 * @instance
	 * @private
	 */
	_onScroll: function () {
		if ( this.$el && this.enabled && this.scrollNearEnd() ) {
			// Disable when triggering an event. Won't trigger again until
			// re-enabled.
			this.disable();
			this.emit( ScrollEndEventEmitter.EVENT_SCROLL_END );
		}
	},
	/**
	 * Is the scroll position near the end of the container element?
	 *
	 * @memberof ScrollEndEventEmitter
	 * @instance
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
	 * Enable the ScrollEndEventEmitter so that it triggers events.
	 *
	 * @memberof ScrollEndEventEmitter
	 * @instance
	 */
	enable: function () {
		this.enabled = true;
		this._bindScroll();
	},
	/**
	 * Disable the ScrollEndEventEmitter so that it doesn't trigger events.
	 *
	 * @memberof ScrollEndEventEmitter
	 * @instance
	 */
	disable: function () {
		this.enabled = false;
		this._unbindScroll();
	},
	/**
	 * Set the element to compare to scroll position to
	 *
	 * @memberof ScrollEndEventEmitter
	 * @instance
	 * @param {jQuery.Object} $el jQuery element where we want to listen for
	 * scroll end.
	 */
	setElement: function ( $el ) {
		this.$el = $el;
	}
} );

module.exports = ScrollEndEventEmitter;
