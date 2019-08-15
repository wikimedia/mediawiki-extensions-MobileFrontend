var
	View = require( './View' ),
	header = require( './headers' ).header,
	Anchor = require( './Anchor' ),
	util = require( './util' ),
	browser = require( './Browser' ).getSingleton(),
	mfExtend = require( './mfExtend' );

/**
 * Mobile modal window
 * @class Overlay
 * @extends View
 * @uses Icon
 * @uses Button
 * @fires Overlay#hide
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
function Overlay( props ) {
	this.isIos = browser.isIos();

	View.call(
		this,
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
						click: ( ev ) => {
							ev.stopPropagation();
						}
					},
					props.events
				)
			}
		)
	);
}

mfExtend( Overlay, View, {
	template: util.template( `
{{^noHeader}}
<div class="overlay-header-container header-container{{#headerChrome}}
	header-chrome{{/headerChrome}} position-fixed">
</div>
{{/noHeader}}
<div class="overlay-content">
	{{>content}}
</div>
<div class="overlay-footer-container position-fixed"></div>
	` ),

	hideTimeout: null,

	/**
	 * Shows the spinner right to the input field.
	 * @memberof Overlay
	 * @instance
	 * @method
	 */
	showSpinner: function () {
		this.$el.find( '.spinner' ).removeClass( 'hidden' );
	},

	/**
	 * Hide the spinner near to the input field.
	 * @memberof Overlay
	 * @instance
	 * @method
	 */
	hideSpinner: function () {
		this.$el.find( '.spinner' ).addClass( 'hidden' );
	},

	/**
	 * @inheritdoc
	 * @memberof Overlay
	 * @instance
	 */
	postRender: function () {
		let headers;
		const footerAnchor = this.options.footerAnchor;
		this.$overlayContent = this.$el.find( '.overlay-content' );
		if ( this.isIos ) {
			this.$el.addClass( 'overlay-ios' );
		}
		if ( footerAnchor ) {
			this.$el.find( '.overlay-footer-container' ).append( new Anchor( footerAnchor ).$el );
		}
		headers = this.options.headers || [
			header(
				this.options.heading,
				this.options.headerActions
			)
		];
		this.$el.find( '.overlay-header-container' ).append( headers );
	},

	/**
	 * ClickBack event handler
	 * @memberof Overlay
	 * @instance
	 * @param {Object} ev event object
	 */
	onExitClick: function ( ev ) {
		const exit = function () {
			this.hide();
		}.bind( this );
		ev.preventDefault();
		ev.stopPropagation();
		if ( this.options.onBeforeExit ) {
			this.options.onBeforeExit( exit, function () {} );
		} else {
			exit();
		}

	},
	/**
	 * Attach overlay to current view and show it.
	 * @memberof Overlay
	 * @instance
	 */
	show: function () {
		var $html = util.getDocument();

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
	},
	/**
	 * Detach the overlay from the current view
	 * Should not be overriden as soon to be deprecated.
	 * @memberof Overlay
	 * @instance
	 * @final
	 * @return {boolean} Whether the overlay was successfully hidden or not
	 */
	hide: function () {
		util.getDocument().removeClass( 'overlay-enabled' );
		// return to last known scroll position
		window.scrollTo( window.pageXOffset, this.scrollTop );

		// Since the hash change event caused by emitting hide will be detected later
		// and to avoid the article being shown during a transition from one overlay to
		// another, we regretfully detach the element asynchronously.
		this.hideTimeout = setTimeout( function () {
			this.$el.detach();
			this.hideTimeout = null;
		}.bind( this ), 0 );

		/**
		 * Fired when the overlay is closed.
		 * @event Overlay#hide
		 */
		this.emit( 'hide' );

		return true;
	},

	/**
	 * Show elements that are selected by the className.
	 * Also hide .hideable elements
	 * Can't use jQuery's hide() and show() because show() sets display: block.
	 * And we want display: table for headers.
	 * @memberof Overlay
	 * @instance
	 * @protected
	 * @param {string} className CSS selector to show
	 */
	showHidden: function ( className ) {
		this.$el.find( '.hideable' ).addClass( 'hidden' );
		this.$el.find( className ).removeClass( 'hidden' );
	}
} );

/**
 * Factory method for an overlay with a single child
 * @memberof Overlay
 * @instance
 * @protected
 * @param {Object} options
 * @param {View} view
 * @return {Overlay}
 */
Overlay.make = function ( options, view ) {
	var overlay = new Overlay( options );
	overlay.$el.find( '.overlay-content' ).append( view.$el );
	return overlay;
};

module.exports = Overlay;
