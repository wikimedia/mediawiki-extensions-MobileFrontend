var
	View = require( './View' ),
	Icon = require( './Icon' ),
	Button = require( './Button' ),
	Anchor = require( './Anchor' ),
	icons = require( './icons' ),
	util = require( './util' ),
	browser = require( './Browser' ).getSingleton(),
	mfExtend = require( './mfExtend' );

/**
 * Mobile modal window
 * @typedef {Object} HeaderButtonDefinition
 * @property {string} href of button
 * @property {string} className of button
 * @property {boolean} disabled whether button is disabled initially
 * @property {string} msg button label
 * @class Overlay
 * @extends View
 * @uses Icon
 * @uses Button
 * @fires Overlay#Overlay-exit
 * @fires Overlay#hide
 * @param {Object} props
 * @param {Object} props.events - custom events to be bound to the overlay.
 * @param {View[]} props.headerActions children (usually buttons or icons)
 *   that should be placed in the header actions
 * @param {boolean} props.noHeader renders an overlay without a header
 * @param {Function} props.onBeforeExit allows a consumer to prevent exits in certain
 *  situations. This callback gets the following parameters:
 *  - 1) the exit function which should be run after the consumer has made their changes.
 * @param {HeaderButtonDefinition[]} [props.headerButtons] define buttons to go in header
 */
function Overlay( props ) {
	this.isIos = browser.isIos();
	// Set to true when overlay has failed to load
	this.hasLoadError = false;

	View.call(
		this,
		util.extend(
			true,
			{ className: 'overlay' },
			props,
			{
				events: util.extend(
					{
						// FIXME: Remove .initial-header selector
						'click .cancel, .confirm, .initial-header .back': 'onExitClick',
						click: 'stopPropagation'
					},
					props.events
				)
			}
		)
	);
}

mfExtend( Overlay, View, {
	/**
	 * Is overlay fullscreen
	 * @memberof Overlay
	 * @instance
	 * @property {boolean}
	 */
	fullScreen: true,

	/**
	 * True if this.hide() should be invoked before firing the Overlay-exit
	 * event
	 * @memberof Overlay
	 * @instance
	 * @property {boolean}
	 */
	hideOnExitClick: true,

	templatePartials: {
		header: mw.template.get( 'mobile.startup', 'header.hogan' ),
		anchor: Anchor.prototype.template,
		button: Button.prototype.template
	},
	template: mw.template.get( 'mobile.startup', 'Overlay.hogan' ),
	/**
	 * @memberof Overlay
	 * @instance
	 * @mixes View#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {string} defaults.saveMessage Caption for save button on edit form.
	 * @property {string} defaults.cancelButton HTML of the cancel button.
	 * @property {string} defaults.backButton HTML of the back button.
	 * @property {View[]} defaults.headerActions children (usually buttons or icons)
	 *  that should be placed in the header actions
	 * @property {HeaderButtonDefinition[]} defaults.headerButtons definitions
	 * @property {boolean} defaults.headerChrome Whether the header has chrome.
	 * @property {string} defaults.spinner HTML of the spinner icon.
	 * @property {Object} [defaults.footerAnchor] options for an optional Anchor
	 *  that can appear in the footer
	 */
	defaults: {
		headerActions: [],
		saveMsg: mw.config.get( 'wgEditSubmitButtonLabelPublish' ) ?
			mw.msg( 'mobile-frontend-editor-publish' ) : mw.msg( 'mobile-frontend-editor-save' ),
		cancelButton: icons.cancel().toHtmlString(),
		backButton: new Icon( {
			tagName: 'button',
			name: 'back',
			additionalClassNames: 'back',
			label: mw.msg( 'mobile-frontend-overlay-close' )
		} ).toHtmlString(),
		headerChrome: false,
		spinner: icons.spinner().toHtmlString()
	},
	/**
	 * Flag overlay to close on content tap
	 * @memberof Overlay
	 * @instance
	 * @property {boolean}
	 */
	closeOnContentTap: false,

	/**
	 * Shows the spinner right to the input field.
	 * @memberof Overlay
	 * @instance
	 * @method
	 */
	showSpinner: function () {
		this.$spinner.removeClass( 'hidden' );
	},

	/**
	 * Hide the spinner near to the input field.
	 * @memberof Overlay
	 * @instance
	 * @method
	 */
	hideSpinner: function () {
		this.$spinner.addClass( 'hidden' );
	},

	/**
	 * @inheritdoc
	 * @memberof Overlay
	 * @instance
	 */
	preRender: function () {
		var props = this.options;
		this.options.hasActions = props.headerButtons || props.headerActions.length;
	},

	/**
	 * @inheritdoc
	 * @memberof Overlay
	 * @instance
	 */
	postRender: function () {
		this.$overlayContent = this.$el.find( '.overlay-content' );
		this.$spinner = this.$el.find( '.spinner' );
		if ( this.isIos ) {
			this.$el.addClass( 'overlay-ios' );
		}
		// Truncate any text inside in the overlay header.
		this.$el.find( '.overlay-header h2 span' ).addClass( 'truncated-text' );
		this.$el.find( '.header-action' ).append(
			this.options.headerActions.map( function ( component ) {
				return component.$el;
			} )
		);
	},

	/**
	 * ClickBack event handler
	 * @memberof Overlay
	 * @instance
	 * @param {Object} ev event object
	 */
	onExitClick: function ( ev ) {
		const exit = function () {
			// FIXME: This check will be removed once ImageOverlay
			// is using onBeforeExit.
			if ( this.hideOnExitClick ) {
				this.hide();
			}
			this.emit( Overlay.EVENT_EXIT );
		}.bind( this );
		ev.preventDefault();
		ev.stopPropagation();
		if ( this.options.onBeforeExit ) {
			this.options.onBeforeExit( exit );
		} else {
			exit();
		}

	},
	/**
	 * Stop clicks in the overlay from propagating to the page
	 * (prevents non-fullscreen overlays from being closed when they're tapped)
	 * @memberof Overlay
	 * @instance
	 * @param {Object} ev Event Object
	 */
	stopPropagation: function ( ev ) {
		ev.stopPropagation();
	},
	/**
	 * Attach overlay to current view and show it.
	 * @memberof Overlay
	 * @instance
	 */
	show: function () {
		var $html = util.getDocument();

		this.scrollTop = window.pageYOffset;

		if ( this.fullScreen ) {
			$html.addClass( 'overlay-enabled' );
			// skip the URL bar if possible
			window.scrollTo( 0, 1 );
		}

		if ( this.closeOnContentTap ) {
			$html.find( '#mw-mf-page-center' ).one( 'click', this.hide.bind( this ) );
		}

		this.$el.addClass( 'visible' );
	},
	/**
	 * Detach the overlay from the current view
	 * @memberof Overlay
	 * @instance
	 * @return {boolean} Whether the overlay was successfully hidden or not
	 */
	hide: function () {
		var $html = util.getDocument();

		if ( this.fullScreen ) {
			$html.removeClass( 'overlay-enabled' );
			// return to last known scroll position
			window.scrollTo( window.pageXOffset, this.scrollTop );
		}

		this.$el.detach();

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

/*
 * Fires when close button is clicked. Not to be confused with hide event.
 * @memberof Overlay
 * @event Overlay#Overlay-exit
 */
Overlay.EVENT_EXIT = 'Overlay-exit';

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
