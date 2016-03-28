( function ( M ) {

	var View = M.require( 'mobile.view/View' ),
		WatchstarGateway = M.require( 'mobile.watchstar/WatchstarGateway' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		watchIcon = new Icon( {
			name: 'watch',
			additionalClassNames: 'watch-this-article'
		} ),
		watchedIcon = new Icon( {
			name: 'watched',
			additionalClassNames: 'watch-this-article watched'
		} ),
		toast = M.require( 'mobile.toast/toast' ),
		user = M.require( 'mobile.user/user' ),
		CtaDrawer = M.require( 'mobile.drawers/CtaDrawer' );

	/**
	 * A clickable watchstar
	 * @class Watchstar
	 * @extends View
	 * @uses CtaDrawer
	 * @uses Icon
	 * @uses WatchstarGateway
	 * @uses Toast
	 */
	function Watchstar( options ) {
		var self = this,
			_super = View,
			page = options.page;

		this.gateway = new WatchstarGateway( options.api );

		if ( user.isAnon() ) {
			_super.call( self, options );
		} else if ( options.isWatched === undefined ) {
			this.gateway.loadWatchStatus( page.getId() ).done( function () {
				options.isWatched = self.gateway.isWatchedPage( page );
				_super.call( self, options );
			} );
		} else {
			this.gateway.setWatchedPage( options.page, options.isWatched );
			_super.call( self, options );
		}
	}

	OO.mfExtend( Watchstar, View, {
		/**
		 * @inheritdoc
		 */
		events: {
			// Disable clicks on original link
			'click a': 'onLinksClick',
			click: 'onStatusToggle'
		},
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {mw.Api} defaults.api
		 * @cfg {Page} defaults.page Current page.
		 * @cfg {String} defaults.funnel to log events with
		 */
		defaults: {
			page: undefined,
			funnel: 'unknown'
		},
		/**
		 * @property {Object} ctaDrawerOptions Default options hash for the anonymous CtaDrawer.
		 */
		ctaDrawerOptions: {
			content: mw.msg( 'mobile-frontend-watchlist-cta' ),
			queryParams: {
				warning: 'mobile-frontend-watchlist-purpose',
				campaign: 'mobile_watchPageActionCta',
				returntoquery: 'article_action=watch'
			},
			signupQueryParams: {
				warning: 'mobile-frontend-watchlist-signup-action'
			}
		},
		tagName: 'div',
		className: watchIcon.getClassName(),
		template: mw.template.compile( '<button>{{tooltip}}</button>', 'hogan' ),
		/** @inheritdoc */
		initialize: function ( options ) {
			var self = this,
				_super = View.prototype.initialize,
				page = options.page;

			this.gateway = new WatchstarGateway( options.api );

			if ( user.isAnon() ) {
				_super.call( self, options );
			} else if ( options.isWatched === undefined ) {
				this.gateway.loadWatchStatus( page.getId() ).done( function () {
					options.isWatched = self.gateway.isWatchedPage( page );
					_super.call( self, options );
				} );
			} else {
				this.gateway.setWatchedPage( options.page, options.isWatched );
				_super.call( self, options );
			}
		},
		/** @inheritdoc */
		preRender: function () {
			this.options.tooltip = this.options.isWatched ? mw.msg( 'unwatchthispage' ) : mw.msg( 'watchthispage' );
		},
		/** @inheritdoc */
		postRender: function () {
			var self = this,
				gateway = this.gateway,
				unwatchedClass = watchIcon.getGlyphClassName(),
				watchedClass = watchedIcon.getGlyphClassName() + ' watched',
				page = self.options.page,
				$el = self.$el;

			// add tooltip to the div, not the <a> inside because that the <a> doesn't have dimensions
			this.$el.attr( 'title', self.options.tooltip );

			// Add watched class if necessary
			if ( !user.isAnon() && gateway.isWatchedPage( page ) ) {
				$el.addClass( watchedClass ).removeClass( unwatchedClass );
			} else {
				$el.addClass( unwatchedClass ).removeClass( watchedClass );
			}
			$el.removeClass( 'hidden' );
		},

		/**
		 * Prevent default on incoming events
		 * @param {jQuery.Event} ev
		 */
		onLinksClick: function ( ev ) {
			ev.preventDefault();
		},

		/**
		 * Triggered when a user anonymously clicks on the watchstar.
		 * @method
		 */
		onStatusToggleAnon: function () {
			if ( !this.drawer ) {
				this.drawer = new CtaDrawer( this.ctaDrawerOptions );

			}
			this.drawer.show();
		},

		/**
		 * Triggered when a logged in user clicks on the watchstar.
		 * @method
		 */
		onStatusToggleUser: function () {
			var self = this,
				gateway = this.gateway,
				page = this.options.page,
				checker;

			checker = setInterval( function () {
				toast.show( mw.msg( 'mobile-frontend-watchlist-please-wait' ) );
			}, 1000 );
			gateway.toggleStatus( page ).always( function () {
				clearInterval( checker );
			} ).done( function () {
				if ( gateway.isWatchedPage( page ) ) {
					self.options.isWatched = true;
					self.render();
					/**
					 * @event watch
					 * Fired when the watch star is changed to watched status
					 */
					self.emit( 'watch' );
					toast.show( mw.msg( 'mobile-frontend-watchlist-add', page.title ) );
				} else {
					self.options.isWatched = false;
					/**
					 * @event unwatch
					 * Fired when the watch star is changed to unwatched status
					 */
					self.emit( 'unwatch' );
					self.render();
					toast.show( mw.msg( 'mobile-frontend-watchlist-removed', page.title ) );
				}
			} ).fail( function () {
				toast.show( 'mobile-frontend-watchlist-error', 'error' );
			} );
		},

		/**
		 * Event handler for clicking on watch star.
		 * Make an API request if user is not anonymous.
		 * @method
		 */
		onStatusToggle: function () {
			if ( user.isAnon() ) {
				this.onStatusToggleAnon.apply( this, arguments );
			} else {
				this.onStatusToggleUser.apply( this, arguments );
			}
		}

	} );

	M.define( 'mobile.watchstar/Watchstar', Watchstar );

}( mw.mobileFrontend ) );
