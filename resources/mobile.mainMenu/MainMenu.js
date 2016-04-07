( function ( M, $ ) {
	var browser = M.require( 'mobile.browser/browser' ),
		View = M.require( 'mobile.view/View' );

	/**
	 * Representation of the main menu
	 *
	 * @class MainMenu
	 * @extends View
	 */
	function MainMenu( options ) {
		this.activator = options.activator;
		View.call( this, options );
	}

	OO.mfExtend( MainMenu, View, {
		/** @inheritdoc */
		isTemplateMode: true,
		/** @inheritdoc */
		template: mw.template.get( 'mobile.mainMenu', 'menu.hogan' ),

		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.activator selector for element that when clicked can open or close the menu
		 */
		defaults: {
			activator: undefined
		},

		/**
		 * Advertise a new feature in the main menu.
		 * @param {String} selector to an element inside the main menu
		 * @param {String} msg a message to show in the pointer
		 * @returns {jQuery.Deferred} with the PointerOverlay as the only argument.
		 * @throws exception when you try to advertise more than one feature.
		 */
		advertiseNewFeature: function ( selector, msg ) {
			var d = $.Deferred(),
				self = this;
			if ( this._hasNewFeature ) {
				throw 'A new feature is already being advertised.';
			} else {
				this._hasNewFeature = true;
			}
			$( function () {
				var $activator = $( self.activator ).eq( 0 );
				$activator.addClass( 'indicator-circle' );
				mw.loader.using( 'mobile.contentOverlays' ).done( function () {
					$activator.one( 'click', function () {
						var po,
							PointerOverlay = M.require( 'mobile.contentOverlays/PointerOverlay' );

						po = new PointerOverlay( {
							appendToElement: self.$el.parent(),
							alignment: 'left',
							summary: msg,
							target: self.$( selector )
						} );
						po.show();
						d.resolve( po );
						$activator.removeClass( 'indicator-circle' );
					} );
				} );
			} );
			return d;
		},

		/**
		 * Turn on event logging on the existing main menu by reading `event-name` data
		 * attributes on elements.
		 */
		enableLogging: function () {
			this.$( 'a' ).on( 'click', function () {
				var $link = $( this ),
					eventName = $link.data( 'event-name' );
				if ( eventName ) {
					mw.track( 'mf.schemaMobileWebMainMenuClickTracking', {
						name: eventName,
						destination: $link.attr( 'href' )
					} );
				}
			} );
		},
		/**
		 * @inheritdoc
		 * Remove the nearby menu entry if the browser doesn't support geo location
		 */
		postRender: function () {
			if ( !browser.supportsGeoLocation() ) {
				this.$el.find( '.nearby' ).parent().remove();
			}

			this.registerClickEvents();
		},

		/**
		 * Registers events for opening and closing the main menu
		 */
		registerClickEvents: function () {
			var self = this;

			// Listen to the main menu button clicks
			$( this.activator )
				.off( 'click' )
				.on( 'click', function ( ev ) {
					if ( self.isOpen() ) {
						self.closeNavigationDrawers();
					} else {
						self.openNavigationDrawer();
					}
					ev.preventDefault();
					// Stop propagation, otherwise the Skin will close the open menus on page center click
					ev.stopPropagation();
				} );
		},

		/**
		 * Check whether the navigation drawer is open
		 * @return {Boolean}
		 */
		isOpen: function () {
			// FIXME: We should be moving away from applying classes to the body
			return $( 'body' ).hasClass( 'navigation-enabled' );
		},

		/**
		 * Close all open navigation drawers
		 */
		closeNavigationDrawers: function () {
			// FIXME: We should be moving away from applying classes to the body
			$( 'body' ).removeClass( 'navigation-enabled' )
				.removeClass( 'secondary-navigation-enabled' )
				.removeClass( 'primary-navigation-enabled' );
		},

		/**
		 * Toggle open navigation drawer
		 * @param {String} [drawerType] A name that identifies the navigation drawer that
		 *     should be toggled open. Defaults to 'primary'.
		 */
		openNavigationDrawer: function ( drawerType ) {
			// close any existing ones first.
			this.closeNavigationDrawers();
			drawerType = drawerType || 'primary';
			// FIXME: We should be moving away from applying classes to the body
			$( 'body' ).toggleClass( 'navigation-enabled' )
				.toggleClass( drawerType + '-navigation-enabled' );
			/**
			 * @event open emitted when navigation drawer is opened
			 */
			this.emit( 'open' );
		}
	} );

	M.define( 'mobile.mainMenu/MainMenu', MainMenu );

}( mw.mobileFrontend, jQuery ) );
