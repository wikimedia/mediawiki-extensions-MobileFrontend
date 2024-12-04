const
	View = require( './View' ),
	header = require( './headers' ).header,
	Anchor = require( './Anchor' ),
	util = require( './util' ),
	browser = require( './Browser' ).getSingleton();

/**
 * Mobile modal window
 *
 * @uses Icon
 * @uses Button
 * @fires Overlay#hide
 */
class Overlay extends View {
	/**
	 * @param {Object} props
	 * @param {Object} props.events - custom events to be bound to the overlay.
	 * @param {boolean} [props.headerChrome] Whether the header has chrome.
	 * @param {View[]} [props.headerActions] children (usually buttons or icons)
	 *   that should be placed in the header actions. Ignored when `headers` used.
	 * @param {string} [props.heading] heading for the overlay header. Use `headers` where
	 *  overlays require more than one header. Ignored when `headers` used.
	 * @param {boolean} props.noHeader renders an overlay without a header
	 * @param {Element[]} [props.headers] allows overlays to have more than one
	 *  header. When used it is an array of jQuery Objects representing
	 *  headers created via the header util function. It is expected that only one of these
	 *  should be visible. If undefined, headerActions and heading is used.
	 * @param {Object} [props.footerAnchor] options for an optional Anchor
	 *  that can appear in the footer
	 * @param {Function} props.onBeforeExit allows a consumer to prevent exits in certain
	 *  situations. This callback gets the following parameters:
	 *  - 1) the exit function which should be run after the consumer has made their changes.
	 *  - 2) the cancel function which should be run if the consumer explicitly changes their mind
	 */
	constructor( props ) {
		super(
			util.extend(
				true,
				{
					headerChrome: false,
					className: 'overlay'
				},
				props,
				{
					events: util.extend(
						{
							// FIXME: Remove .initial-header selector
							'click .cancel, .confirm, .initial-header .back': 'onExitClick',
							click: ( ev ) => ev.stopPropagation()
						},
						props.events
					)
				}
			)
		);
	}

	get template() {
		return util.template( `
{{^noHeader}}
<div class="overlay-header-container header-container{{#headerChrome}}
	header-chrome{{/headerChrome}} position-fixed">
</div>
{{/noHeader}}
<div class="overlay-content">
	{{>content}}
</div>
<div class="overlay-footer-container position-fixed"></div>
	` );
	}

	get isIos() {
		return browser.isIos();
	}

	set hideTimeout( timeout ) {
		this._hideTimeout = timeout;
	}

	get hideTimeout() {
		return this._hideTimeout;
	}

	/**
	 * Shows the spinner right to the input field.
	 *
	 * @memberof module:mobile.startup/Overlay
	 * @instance
	 * @method
	 */
	showSpinner() {
		this.$el.find( '.spinner' ).removeClass( 'hidden' );
	}

	/**
	 * Hide the spinner near to the input field.
	 *
	 * @memberof module:mobile.startup/Overlay
	 * @instance
	 * @method
	 */
	hideSpinner() {
		this.$el.find( '.spinner' ).addClass( 'hidden' );
	}

	/**
	 * @inheritdoc
	 * @memberof module:mobile.startup/Overlay
	 * @instance
	 */
	postRender() {
		const footerAnchor = this.options.footerAnchor;
		this.$overlayContent = this.$el.find( '.overlay-content' );
		if ( this.isIos ) {
			this.$el.addClass( 'overlay-ios' );
		}
		if ( footerAnchor ) {
			this.$el.find( '.overlay-footer-container' ).append( new Anchor( footerAnchor ).$el );
		}
		const headers = this.options.headers || [
			header(
				this.options.heading,
				this.options.headerActions
			)
		];
		this.$el.find( '.overlay-header-container' ).append( headers );
	}

	/**
	 * ClickBack event handler
	 *
	 * @memberof module:mobile.startup/Overlay
	 * @instance
	 * @param {Object} ev event object
	 */
	onExitClick( ev ) {
		const exit = () => {
			this.hide();
		};
		ev.preventDefault();
		ev.stopPropagation();
		if ( this.options.onBeforeExit ) {
			this.options.onBeforeExit( exit, () => {
			} );
		} else {
			exit();
		}

	}

	/**
	 * Attach overlay to current view and show it.
	 *
	 * @memberof module:mobile.startup/Overlay
	 * @instance
	 */
	show() {
		const $html = util.getDocument();

		this.scrollTop = window.pageYOffset;

		$html.addClass( 'overlay-enabled' );
		// skip the URL bar if possible
		window.scrollTo( 0, 1 );

		this.$el.addClass( 'visible' );

		// If .hide() was called earlier, and it scheduled an asynchronous detach
		// but it hasn't happened yet, cancel it
		if ( this.hideTimeout !== null ) {
			clearTimeout( this.hideTimeout );
			this.hideTimeout = null;
		}
	}

	/**
	 * Detach the overlay from the current view
	 * Should not be overriden as soon to be deprecated.
	 *
	 * @memberof module:mobile.startup/Overlay
	 * @instance
	 * @final
	 * @return {boolean} Whether the overlay was successfully hidden or not
	 */
	hide() {
		util.getDocument().removeClass( 'overlay-enabled' );
		// return to last known scroll position
		window.scrollTo( window.pageXOffset, this.scrollTop );

		// Since the hash change event caused by emitting hide will be detected later
		// and to avoid the article being shown during a transition from one overlay to
		// another, we regretfully detach the element asynchronously.
		this.hideTimeout = setTimeout( () => {
			this.$el.detach();
			this.hideTimeout = null;
		}, 0 );

		/**
		 * Fired when the overlay is closed.
		 *
		 * @event Overlay#hide
		 */
		this.emit( 'hide' );

		return true;
	}

	/**
	 * Show elements that are selected by the className.
	 * Also hide .hideable elements
	 * Can't use jQuery's hide() and show() because show() sets display: block.
	 * And we want display: table for headers.
	 *
	 * @memberof module:mobile.startup/Overlay
	 * @instance
	 * @protected
	 * @param {string} className CSS selector to show
	 */
	showHidden( className ) {
		this.$el.find( '.hideable' ).addClass( 'hidden' );
		this.$el.find( className ).removeClass( 'hidden' );
	}
}

/**
 * Factory method for an overlay with a single child
 *
 * @memberof module:mobile.startup/Overlay
 * @instance
 * @protected
 * @param {Object} options
 * @param {module:mobile.startup/View} view
 * @return {module:mobile.startup/Overlay}
 */
Overlay.make = function ( options, view ) {
	const overlay = new Overlay( options );
	overlay.$el.find( '.overlay-content' ).append( view.$el );
	return overlay;
};

/**
 * ES5 compatible version of class for backwards compatibility
 *
 * @param {Object} props
 * @deprecated 1.44
 * @ignore
 */
function ClassES5( props ) {
	mw.log.warn( '[1.44] Extending Overlay class constructor is deprecated. Please use Overlay.make' );
	View.ClassES5.call( this, util.extend(
		true,
		{
			headerChrome: false,
			className: 'overlay'
		},
		props,
		{
			events: util.extend(
				{
					// FIXME: Remove .initial-header selector
					'click .cancel, .confirm, .initial-header .back': 'onExitClick',
					click: ( ev ) => ev.stopPropagation()
				},
				props.events
			)
		}
	) );
}
ClassES5.prototype = Overlay.prototype;
ClassES5.make = Overlay.make;

Overlay.ClassES5 = ClassES5;
module.exports = Overlay;
