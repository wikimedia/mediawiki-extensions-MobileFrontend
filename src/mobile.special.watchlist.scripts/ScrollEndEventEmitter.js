const util = require( '../mobile.startup/util' );

/**
 * Class to assist a view in implementing infinite scrolling on some DOM
 * element. This module itself is only responsible for emitting an Event when
 * the bottom of an Element is scrolled to.
 *
 * @class ScrollEndEventEmitter
 * @mixes OO.EventEmitter
 *
 * Use this class in a view to help it do infinite scrolling.
 *
 * 1. Initialize it in the constructor `initialize` and listen to the
 *   EVENT_SCROLL_END event it emits (and call your loading function then)
 * 2. On preRender (once we have the DOM element) set it into the infinite
 *   scrolling object and disable it until we've loaded.
 * 3. Once you have loaded the list and put it in the DOM, enable the
 *   infinite scrolling detection.
 *   - Every time the scroller detection triggers a load, it auto disables
 *     to not trigger multiple times. After you have loaded, manually
 *     re-enable it.
 *
 * Example:
 *     @example
 *     <code>
 *       var
 *         ScrollEndEventEmitter = require( './ScrollEndEventEmitter' ),
 *         eventBus = require( './eventBusSingleton' );
 *       class PhotoList extends View {
 *         //...
 *         initialize: function ( options ) {
 *           this.gateway = new PhotoListGateway( {
 *             username: options.username
 *           } );
 *           // 1. Set up infinite scroll helper and listen to events
 *           this.scrollEndEventEmitter = new ScrollEndEventEmitter( eventBus, 1000 );
 *           this.scrollEndEventEmitter.on( ScrollEndEventEmitter.EVENT_SCROLL_END,
 *             this._loadPhotos.bind( this ) );
 *           super.initialize( options );
 *         },
 *         preRender: function () {
 *           // 2. Disable until we've got the list rendered and set DOM el
 *           this.scrollEndEventEmitter.setElement( this.$el );
 *           this.scrollEndEventEmitter.disable();
 *         },
 *         _loadPhotos: function () {
 *           this.gateway.getPhotos().then( ( photos ) => {
 *             // load photos into the DOM ...
 *             // 3. and (re-)enable infinite scrolling
 *             this.scrollEndEventEmitter.enable();
 *           } );
 *         }
 *       }
 *     </code>
 *
 * @fires ScrollEndEventEmitter#ScrollEndEventEmitter-scrollEnd
 */
class ScrollEndEventEmitter {
	/**
	 * @param {Object} eventBus object to listen for scroll:throttled events
	 * @param {number} [threshold=100] distance in pixels used to calculate if scroll
	 * position is near the end of the $el
	 */
	constructor( eventBus, threshold ) {
		this.threshold = threshold || 100;
		this.eventBus = eventBus;
		this.enable();
		OO.EventEmitter.call( this );
	}

	/**
	 * Listen to scroll on window and notify this._onScroll
	 *
	 * @private
	 */
	_bindScroll() {
		if ( !this._scrollHandler ) {
			this._scrollHandler = () => this._onScroll();
			this.eventBus.on( 'scroll:throttled', this._scrollHandler );
		}
	}

	/**
	 * Unbind scroll handler
	 *
	 * @private
	 */
	_unbindScroll() {
		if ( this._scrollHandler ) {
			this.eventBus.off( 'scroll:throttled', this._scrollHandler );
			this._scrollHandler = null;
		}
	}

	/**
	 * Scroll handler. Triggers load event when near the end of the container.
	 *
	 * @private
	 */
	_onScroll() {
		if ( this.$el && this.enabled && this.scrollNearEnd() ) {
			// Disable when triggering an event. Won't trigger again until
			// re-enabled.
			this.disable();
			this.emit( ScrollEndEventEmitter.EVENT_SCROLL_END );
		}
	}

	/**
	 * Is the scroll position near the end of the container element?
	 *
	 * @private
	 * @return {boolean}
	 */
	scrollNearEnd() {
		if ( !this.$el || !this.$el.offset() ) {
			return false;
		}
		const $window = util.getWindow(),
			scrollBottom = $window.scrollTop() + $window.height(),
			endPosition = this.$el.offset().top + this.$el.outerHeight();
		return scrollBottom + this.threshold > endPosition;
	}

	/**
	 * Enable the ScrollEndEventEmitter so that it triggers events.
	 */
	enable() {
		this.enabled = true;
		this._bindScroll();
	}

	/**
	 * Disable the ScrollEndEventEmitter so that it doesn't trigger events.
	 */
	disable() {
		this.enabled = false;
		this._unbindScroll();
	}

	/**
	 * Set the element to compare to scroll position to
	 *
	 * @param {jQuery.Object} $el jQuery element where we want to listen for
	 * scroll end.
	 */
	setElement( $el ) {
		this.$el = $el;
	}
}
OO.mixinClass( ScrollEndEventEmitter, OO.EventEmitter );

/**
 * Fired when scroll bottom has been reached.
 *
 * @event ScrollEndEventEmitter#ScrollEndEventEmitter-scrollEnd
 */
ScrollEndEventEmitter.EVENT_SCROLL_END = 'ScrollEndEventEmitter-scrollEnd';

module.exports = ScrollEndEventEmitter;
