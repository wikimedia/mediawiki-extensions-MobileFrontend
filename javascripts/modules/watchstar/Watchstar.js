( function ( M ) {

	var Watchstar,
		View = M.require( 'View' ),
		WatchstarApi = M.require( 'modules/watchstar/WatchstarApi' ),
		Icon = M.require( 'Icon' ),
		watchIcon = new Icon( {
			name: 'watch',
			additionalClassNames: 'icon-32px watch-this-article'
		} ),
		watchedIcon = new Icon( {
			name: 'watched',
			additionalClassNames: 'icon-32px watch-this-article'
		} ),
		toast = M.require( 'toast' ),
		user = M.require( 'user' ),
		api = new WatchstarApi(),
		CtaDrawer = M.require( 'CtaDrawer' );

	/**
	 * A clickable watchstar
	 * @class Watchstar
	 * @extends View
	 * @uses CtaDrawer
	 * @uses Icon
	 * @uses WatchstarApi
	 * @uses Toast
	 */
	Watchstar = View.extend( {
		events: {
			// Disable clicks on original link
			'click a': 'onLinksClick',
			click: 'onStatusToggle'
		},
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Page} defaults.page Current page.
		 */
		defaults: {
			page: M.getCurrentPage()
		},
		tagName: 'div',
		className: watchIcon.getClassName(),
		template: mw.template.compile( '<span>{{tooltip}}</span>', 'hogan' ),
		/** @inheritdoc */
		initialize: function ( options ) {
			var self = this,
				_super = View.prototype.initialize,
				page = options.page;

			this.drawer = new CtaDrawer( {
				content: mw.msg( 'mobile-frontend-watchlist-cta' ),
				queryParams: {
					campaign: 'mobile_watchPageActionCta',
					returntoquery: 'article_action=watch'
				}
			} );

			if ( user.isAnon() ) {
				_super.call( self, options );
			} else if ( options.isWatched === undefined ) {
				api.load( page.getId() ).done( function () {
					options.isWatched = api.isWatchedPage( page );
					_super.call( self, options );
				} );
			} else {
				api.setWatchedPage( options.page, options.isWatched );
				_super.call( self, options );
			}
		},
		/** @inheritdoc */
		preRender: function ( options ) {
			options.tooltip = options.isWatched ? mw.msg( 'unwatchthispage' ) : mw.msg( 'watchthispage' );
		},
		/** @inheritdoc */
		postRender: function ( options ) {
			var self = this,
				unwatchedClass = watchIcon.getGlyphClassName(),
				watchedClass = watchedIcon.getGlyphClassName(),
				page = options.page,
				$el = self.$el;

			// add tooltip to the div, not the <a> inside because that the <a> doesn't have dimensions
			this.$el.attr( 'title', options.tooltip );

			// Add watched class if necessary
			if ( !user.isAnon() && api.isWatchedPage( page ) ) {
				$el.addClass( watchedClass ).removeClass( unwatchedClass );
			} else {
				$el.addClass( unwatchedClass ).removeClass( watchedClass );
			}
			$el.removeClass( 'hidden' );
		},

		/**
		 * Prevent default on incoming events
		 */
		onLinksClick: function ( ev ) {
			ev.preventDefault();
		},

		/**
		 * Event handler for clicking on watch star.
		 * Make an API request if user is not anonymous.
		 * @method
		 */
		onStatusToggle: function () {
			var self = this,
				page = this.options.page,
				checker;
			if ( user.isAnon() ) {
				this.drawer.show();
			} else {
				checker = setInterval( function () {
					toast.show( mw.msg( 'mobile-frontend-watchlist-please-wait' ) );
				}, 1000 );
				api.toggleStatus( page ).always( function () {
					clearInterval( checker );
				} ).done( function () {
					if ( api.isWatchedPage( page ) ) {
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
			}
		}

	} );

	M.define( 'modules/watchstar/Watchstar', Watchstar );

}( mw.mobileFrontend ) );
