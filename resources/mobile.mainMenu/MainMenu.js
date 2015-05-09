( function ( M, $ ) {
	var MainMenu,
		browser = M.require( 'browser' ),
		View = M.require( 'View' );

	/**
	 * Representation of the main menu
	 *
	 * @class MainMenu
	 * @extends View
	 */
	MainMenu = View.extend( {
		template: mw.template.get( 'mobile.mainMenu', 'menu.hogan' ),
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash
		 */
		defaults: $.extend( {}, mw.config.get( 'wgMFMenuData' ) || {} ),

		/**
		 * Turn on event logging on the existing main menu by reading `event-name` data
		 * attributes on elements.
		 * @param {SchemaMobileWebClickTracking} schema to use
		 */
		enableLogging: function ( schema ) {
			this.$( 'a' ).each( function () {
				var $link = $( this ),
					eventName = $link.data( 'event-name' );
				if ( eventName ) {
					schema.hijackLink( $link, eventName );
				}
			} );
		},
		/**
		 * @inheritdoc
		 * Remove the nearby menu entry if the browser doesn't support geo location
		 */
		postRender: function () {
			var self = this;

			if ( !browser.supportsGeoLocation() ) {
				this.$el.find( '.nearby' ).parent().remove();
			}

			// Listen to the main menu button clicks
			// In alpha there is no #mw-mf-main-menu-button, the user can click on the header
			// search icon or the site name in the header to open the main menu
			$( '#mw-mf-main-menu-button, .alpha .header a.header-icon, .alpha .header .header-title a' )
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

			// FIXME: Remove all of the below when cache cleared and mw-ui-icon used everywhere.
			this.$( '.icon-text' ).addClass( 'mw-ui-icon-before' ).removeClass( 'icon-text mw-ui-icon-before' );
			this.$( '.icon' ).addClass( 'mw-ui-icon mw-ui-icon-before' ).removeClass( 'icon' )
				.each( function () {
					// replace the glyph
					var $link = $( this ),
						classes = ( $link.attr( 'class' ) || '' ).split( /\s+/ );
					$link.attr( 'class', $.map( classes, function ( c ) {
						return c.replace( /^icon-(.*)$/, 'mw-ui-icon-$1' );
					} ).join( ' ' ) );
				} );
			// Use template for entire view
			// FIXME: Icon and MainMenu now do this. Revisit className and tagName properties
			// See https://phabricator.wikimedia.org/T97663
			this.$el = this.$el.children( 0 );
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
		}
	} );

	M.define( 'MainMenu', MainMenu );

}( mw.mobileFrontend, jQuery ) );
