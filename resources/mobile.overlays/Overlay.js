/*jshint unused:vars */
( function ( M, $ ) {

	var View = M.require( 'mobile.view/View' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		Button = M.require( 'mobile.startup/Button' ),
		Anchor = M.require( 'mobile.startup/Anchor' ),
		icons = M.require( 'mobile.startup/icons' ),
		browser = M.require( 'mobile.browser/browser' ),
		$window = $( window );

	/**
	 * Mobile modal window
	 * @class Overlay
	 * @extends View
	 * @uses Icon
	 * @uses Button
	 */
	function Overlay() {
		this.isIos = browser.isIos();
		this.isIos8 = browser.isIos( 8 );
		// https://phabricator.wikimedia.org/T106934
		// tldr: closing keyboard doesn't trigger a blur event
		if ( this.isIos8 ) {
			this.hasFixedHeader = false;
		}
		View.apply( this, arguments );
	}

	OO.mfExtend( Overlay, View, {
		/**
		 * Identify whether the element contains position fixed elements
		 * @property {Boolean}
		 */
		hasFixedHeader: true,
		/**
		 * Is overlay fullscreen
		 * @property {Boolean}
		 */
		fullScreen: true,

		/**
		 * use '#mw-mf-viewport' rather than 'body' - for some reasons this has
		 * odd consequences on Opera Mobile (see bug 52361)
		 * @property {String|jQuery.Object}
		 */
		appendToElement: '#mw-mf-viewport',

		/**
		 * Default class name
		 * @property {String}
		 */
		className: 'overlay',
		templatePartials: {
			header: mw.template.get( 'mobile.overlays', 'header.hogan' ),
			anchor: Anchor.prototype.template,
			button: Button.prototype.template
		},
		template: mw.template.get( 'mobile.overlays', 'Overlay.hogan' ),
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.saveMessage Caption for save button on edit form.
		 * @cfg {String} defaults.cancelButton HTML of the cancel button.
		 * @cfg {String} defaults.backButton HTML of the back button.
		 * @cfg {String} defaults.headerButtonsListClassName A comma separated string of class
		 * names of the wrapper of the header buttons.
		 * @cfg {Boolean} defaults.fixedHeader Whether the header is fixed.
		 * @cfg {String} defaults.spinner HTML of the spinner icon.
		 * @cfg {Object} [defaults.footerAnchor] options for an optional Anchor that can appear in the footer
		 */
		defaults: {
			saveMsg: mw.msg( 'mobile-frontend-editor-save' ),
			cancelButton: new Icon( {
				tagName: 'button',
				name: 'close',
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
			fixedHeader: true,
			spinner: icons.spinner().toHtmlString()
		},
		events: {
			// FIXME: Remove .initial-header selector when bug 71203 resolved.
			'click .cancel, .confirm, .initial-header .back': 'onExit',
			click: 'stopPropagation'
		},
		/**
		 * Flag overlay to close on content tap
		 * @property {Boolean}
		 */
		closeOnContentTap: false,

		/**
		 * Shows the spinner right to the input field.
		 * @method
		 */
		showSpinner: function () {
			this.$spinner.removeClass( 'hidden' );
		},

		/**
		 * Hide the spinner near to the input field.
		 * @method
		 */
		clearSpinner: function () {
			this.$spinner.addClass( 'hidden' );
		},

		/** @inheritdoc */
		postRender: function () {
			var self = this;

			this.$overlayContent = this.$( '.overlay-content' );
			this.$spinner = this.$( '.spinner' );
			if ( this.isIos ) {
				this.$el.addClass( 'overlay-ios' );
			}
			// Truncate any text inside in the overlay header.
			this.$( '.overlay-header h2 span' ).addClass( 'truncated-text' );

			if ( this.isIos && this.hasFixedHeader ) {
				this.$( '.overlay-content' ).on( 'touchstart', $.proxy( this, 'onTouchStart' ) );
				this.$( '.overlay-content' ).on( 'touchmove', $.proxy( this, 'onTouchMove' ) );
				// wait for things to render before doing any calculations
				setTimeout( function () {
					self._fixIosHeader( 'textarea, input' );
				}, 0 );
			}
		},
		/**
		 * ClickBack event handler
		 * @param {Object} ev event object
		 */
		onExit: function ( ev ) {
			ev.preventDefault();
			ev.stopPropagation();
			window.history.back();
		},
		/**
		* Event handler for touchstart, for IOS
		* @param {Object} ev Event Object
		*/
		onTouchStart: function ( ev ) {
			this.startY = ev.originalEvent.touches[0].pageY;
		},
		/**
		* Event handler for touch move, for IOS
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
		 * @param {Object} ev Event Object
		 */
		stopPropagation: function ( ev ) {
			ev.stopPropagation();
		},
		/**
		 * Attach overlay to current view and show it.
		 * @method
		 */
		show: function () {
			var self = this;
			this.$el.appendTo( this.appendToElement );
			this.scrollTop = $( document ).scrollTop();

			if ( this.fullScreen ) {
				$( 'html' ).addClass( 'overlay-enabled' );
				// skip the URL bar if possible
				window.scrollTo( 0, 1 );
			}

			if ( this.closeOnContentTap ) {
				$( '#mw-mf-page-center' ).one( 'click', $.proxy( this, 'hide' ) );
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
		 * @method
		 * @param {Boolean} [force] Whether the overlay should be closed regardless of
		 * state (see PhotoUploadProgress)
		 * @return {Boolean} Whether the overlay was successfully hidden or not
		 */
		hide: function ( force ) {
			if ( this.fullScreen ) {
				$( 'html' ).removeClass( 'overlay-enabled' );
				// return to last known scroll position
				window.scrollTo( document.body.scrollLeft, this.scrollTop );
			}

			this.$el.detach();

			if ( this.isIos ) {
				$window.off( '.ios' );
			}

			/**
			 * @event hide
			 * Fired when the overlay is closed.
			 */
			this.emit( 'hide' );

			return true;
		},

		/**
		 * Fit the overlay content height to the window taking overlay header and footer heights
		 * into consideration.
		 * @method
		 * @private
		 * @param {Number} windowHeight The height of the window
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
		 * @method
		 * @private
		 * @param {String} el CSS selector for elements that may trigger virtual
		 * keyboard (usually inputs, textareas, contenteditables).
		 */
		_fixIosHeader: function ( el ) {
			var self = this;

			if ( this.isIos ) {
				this._resizeContent( $( window ).height() );
				$( el )
					.on( 'focus', function () {
						setTimeout( function () {
							var keyboardHeight = 0;

							// detect virtual keyboard height
							if ( !self.isIos8 ) {
								// this method does not work in iOS 8.02
								$window.scrollTop( 999 );
								keyboardHeight = $window.scrollTop();
								$window.scrollTop( 0 );
							} // FIXME: implement a solution from https://devforums.apple.com/message/1050636#1050636

							if ( $window.height() > keyboardHeight ) {
								self._resizeContent( $window.height() - keyboardHeight );
							}
						}, 0 );
					} )
					.on( 'blur', function () {
						self._resizeContent( $window.height() );
					} );
			}
		},

		/**
		 * Show elements that are selected by the className.
		 * Also hide .hideable elements
		 * Can't use jQuery's hide() and show() because show() sets display: block.
		 * And we want display: table for headers.
		 * @method
		 * @protected
		 * @param {String} className CSS selector to show
		 */
		showHidden: function ( className ) {
			this.$( '.hideable' ).addClass( 'hidden' );
			this.$( className ).removeClass( 'hidden' );
		}
	} );

	M.define( 'mobile.overlays/Overlay', Overlay );

}( mw.mobileFrontend, jQuery ) );
