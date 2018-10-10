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
 * @class Overlay
 * @extends View
 * @uses Icon
 * @uses Button
 * @fires Overlay#Overlay-exit
 * @fires Overlay#hide
 */
function Overlay() {
	this.isIos = browser.isIos();
	this.useVirtualKeyboardHack = browser.isIos( 4 ) || browser.isIos( 5 );
	// Set to true when overlay has failed to load
	this.hasLoadError = false;
	View.apply( this, arguments );
}

mfExtend( Overlay, View, {
	/**
	 * Identify whether the element contains position fixed elements
	 * @memberof Overlay
	 * @instance
	 * @property {boolean}
	 */
	hasFixedHeader: true,
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

	/**
	 * use '#mw-mf-viewport' rather than 'body' - for some reasons this has
	 * odd consequences on Opera Mobile (see bug 52361)
	 * @memberof Overlay
	 * @instance
	 * @property {string|jQuery.Object}
	 */
	appendToElement: '#mw-mf-viewport',

	/**
	 * Default class name
	 * @memberof Overlay
	 * @instance
	 * @property {string}
	 */
	className: 'overlay',
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
	 * @property {string} defaults.headerButtonsListClassName A comma separated string of class
	 * names of the wrapper of the header buttons.
	 * @property {boolean} defaults.headerChrome Whether the header has chrome.
	 * @property {boolean} defaults.fixedHeader Whether the header is fixed.
	 * @property {string} defaults.spinner HTML of the spinner icon.
	 * @property {Object} [defaults.footerAnchor] options for an optional Anchor
	 *  that can appear in the footer
	 */
	defaults: {
		saveMsg: mw.msg( 'mobile-frontend-editor-save' ),
		cancelButton: new Icon( {
			tagName: 'button',
			name: 'overlay-close',
			additionalClassNames: 'cancel',
			label: mw.msg( 'mobile-frontend-overlay-close' )
		} ).toHtmlString(),
		backButton: new Icon( {
			tagName: 'button',
			name: 'back',
			additionalClassNames: 'back',
			label: mw.msg( 'mobile-frontend-overlay-close' )
		} ).toHtmlString(),
		headerButtonsListClassName: '',
		headerChrome: false,
		fixedHeader: true,
		spinner: icons.spinner().toHtmlString()
	},
	/**
	 * @memberof Overlay
	 * @instance
	 */
	events: {
		// FIXME: Remove .initial-header selector when bug 71203 resolved.
		'click .cancel, .confirm, .initial-header .back': 'onExitClick',
		click: 'stopPropagation'
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
	postRender: function () {

		this.$overlayContent = this.$( '.overlay-content' );
		this.$spinner = this.$( '.spinner' );
		if ( this.isIos ) {
			this.$el.addClass( 'overlay-ios' );
		}
		// Truncate any text inside in the overlay header.
		this.$( '.overlay-header h2 span' ).addClass( 'truncated-text' );
		this.setupEmulatedIosOverlayScrolling();
	},

	/**
	 * Setups an emulated scroll behaviour for overlays in ios.
	 * @memberof Overlay
	 * @instance
	 */
	setupEmulatedIosOverlayScrolling: function () {
		var self = this;
		if ( this.isIos && this.hasFixedHeader ) {
			this.$( '.overlay-content' ).on( 'touchstart', this.onTouchStart.bind( this ) )
				.on( 'touchmove', this.onTouchMove.bind( this ) );
			// wait for things to render before doing any calculations
			setTimeout( function () {
				self._fixIosHeader( self.$( 'textarea, input' ) );
			}, 0 );
		}
	},
	/**
	 * ClickBack event handler
	 * @memberof Overlay
	 * @instance
	 * @param {Object} ev event object
	 */
	onExitClick: function ( ev ) {
		ev.preventDefault();
		ev.stopPropagation();
		if ( this.hideOnExitClick ) {
			this.hide();
		}
		this.emit( Overlay.EVENT_EXIT );
	},
	/**
	 * Event handler for touchstart, for IOS
	 * @memberof Overlay
	 * @instance
	 * @param {Object} ev Event Object
	 */
	onTouchStart: function ( ev ) {
		this.startY = ev.originalEvent.touches[0].pageY;
	},
	/**
	 * Event handler for touch move, for IOS
	 * @memberof Overlay
	 * @instance
	 * @param {Object} ev Event Object
	 */
	onTouchMove: function ( ev ) {
		var
			y = ev.originalEvent.touches[0].pageY,
			contentOuterHeight = this.$overlayContent.outerHeight(),
			contentLength = this.$overlayContent.prop( 'scrollHeight' ) - contentOuterHeight;

		ev.stopPropagation();
		// prevent scrolling and bouncing outside of .overlay-content
		if (
			( this.$overlayContent.scrollTop() === 0 && this.startY < y ) ||
			( this.$overlayContent.scrollTop() === contentLength && this.startY > y )
		) {
			ev.preventDefault();
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
		var self = this,
			$html = util.getDocument(),
			$window = util.getWindow();

		this.$el.appendTo( this.appendToElement );
		this.scrollTop = window.pageYOffset;

		if ( this.fullScreen ) {
			$html.addClass( 'overlay-enabled' );
			// skip the URL bar if possible
			window.scrollTo( 0, 1 );
		}

		if ( this.closeOnContentTap ) {
			$html.find( '#mw-mf-page-center' ).one( 'click', this.hide.bind( this ) );
		}

		// prevent scrolling and bouncing outside of .overlay-content
		if ( this.isIos && this.hasFixedHeader ) {
			$window
				.on( 'touchmove.ios', function ( ev ) {
					ev.preventDefault();
				} )
				.on( 'resize.ios', function () {
					self._resizeContent( $window.height() );
				} );
		}

		this.$el.addClass( 'visible' );
	},
	/**
	 * Detach the overlay from the current view
	 * @memberof Overlay
	 * @instance
	 * @param {boolean} [force] Whether the overlay should be closed regardless of
	 * state (see PhotoUploadProgress)
	 * @return {boolean} Whether the overlay was successfully hidden or not
	 */
	hide: function () {
		var $window = util.getWindow(),
			$html = util.getDocument();

		if ( this.fullScreen ) {
			$html.removeClass( 'overlay-enabled' );
			// return to last known scroll position
			window.scrollTo( window.pageXOffset, this.scrollTop );
		}

		this.$el.detach();

		if ( this.isIos ) {
			$window.off( '.ios' );
		}

		/**
		 * Fired when the overlay is closed.
		 * @event Overlay#hide
		 */
		this.emit( 'hide' );

		return true;
	},

	/**
	 * Fit the overlay content height to the window taking overlay header and footer heights
	 * into consideration.
	 * @memberof Overlay
	 * @instance
	 * @private
	 * @param {number} windowHeight The height of the window
	 */
	_resizeContent: function ( windowHeight ) {
		this.$overlayContent.height(
			windowHeight -
			this.$( '.overlay-header-container' ).outerHeight() -
			this.$( '.overlay-footer-container' ).outerHeight()
		);
	},

	/**
	 * Resize .overlay-content to occupy 100% of screen space when virtual
	 * keyboard is shown/hidden on iOS.
	 *
	 * This function supplements the custom styles for Overlays on iOS.
	 * On iOS we scroll the content inside of .overlay-content div instead
	 * of scrolling the whole page to achieve a consistent sticky header
	 * effect (position: fixed doesn't work on iOS when the virtual keyboard
	 * is open).
	 *
	 * @memberof Overlay
	 * @instance
	 * @private
	 * @param {jQuery.Object} $el for elements that may trigger virtual
	 * keyboard (usually inputs, textareas, contenteditables).
	 */
	_fixIosHeader: function ( $el ) {
		var self = this,
			$window = util.getWindow();

		if ( this.isIos ) {
			this._resizeContent( $window.height() );
			$el
				.on( 'focus', function () {
					setTimeout( function () {
						var keyboardHeight = 0;

						// detect virtual keyboard height
						if ( self.useVirtualKeyboardHack ) {
							// this method does not work in iOS 8.02
							$window.scrollTop( 999 );
							keyboardHeight = $window.scrollTop();
							$window.scrollTop( 0 );
						}

						if ( $window.height() > keyboardHeight ) {
							self._resizeContent( $window.height() - keyboardHeight );
						}
					}, 0 );
				} )
				.on( 'blur', function () {
					self._resizeContent( $window.height() );
					// restore the fixed header in view.
					$window.scrollTop( 0 );
				} );
		}
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
		this.$( '.hideable' ).addClass( 'hidden' );
		this.$( className ).removeClass( 'hidden' );
	}
} );

/*
 * Fires when close button is clicked. Not to be confused with hide event.
 * @memberof Overlay
 * @event Overlay#Overlay-exit
 */
Overlay.EVENT_EXIT = 'Overlay-exit';

module.exports = Overlay;
