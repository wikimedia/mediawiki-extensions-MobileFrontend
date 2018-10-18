( function ( M ) {

	var View = M.require( 'mobile.startup/View' ),
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
		toast = M.require( 'mobile.startup/toast' ),
		user = M.require( 'mobile.startup/user' ),
		CtaDrawer = M.require( 'mobile.startup/CtaDrawer' );

	/**
	 * A clickable watchstar
	 * @class Watchstar
	 * @extends View
	 * @uses CtaDrawer
	 * @uses Icon
	 * @uses WatchstarGateway
	 * @uses Toast
	 * @fires Watchstar#unwatch
	 * @fires Watchstar#watch
	 *
	 * @param {Object} options Configuration options
	 */
	function Watchstar() {
		View.apply( this, arguments );
	}

	OO.mfExtend( Watchstar, View, {
		/**
		 * @inheritdoc
		 * @memberof Watchstar
		 * @instance
		 */
		events: {
			// Disable clicks on original link
			'click a': 'onLinksClick',
			click: 'onStatusToggle'
		},
		/**
		 * @memberof Watchstar
		 * @instance
		 * @mixes View#defaults
		 * @property {Object} defaults Default options hash.
		 * @property {mw.Api} defaults.api
		 * @property {Page} defaults.page Current page.
		 * @property {string} defaults.funnel to log events with
		 */
		defaults: {
			page: undefined,
			funnel: 'unknown'
		},
		/**
		 * @memberof Watchstar
		 * @instance
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
		/**
		 * @memberof Watchstar
		 * @instance
		 */
		tagName: 'div',
		/**
		 * @memberof Watchstar
		 * @instance
		 */
		className: watchIcon.getClassName(),
		/**
		 * @memberof Watchstar
		 * @instance
		 */
		template: mw.template.compile( '<a role="button">{{tooltip}}</a>', 'hogan' ),
		/**
		 * @inheritdoc
		 * @memberof Watchstar
		 * @instance
		 */
		initialize: function ( options ) {
			var self = this,
				_super = View.prototype.initialize;

			this._watched = options.isWatched;
			this.gateway = new WatchstarGateway( options.api );

			_super.call( self, options );
		},
		/**
		 * @inheritdoc
		 * @memberof Watchstar
		 * @instance
		 */
		preRender: function () {
			this.options.tooltip = this._watched ? mw.msg( 'unwatchthispage' ) : mw.msg( 'watchthispage' );
		},
		/**
		 * @inheritdoc
		 * @memberof Watchstar
		 * @instance
		 */
		postRender: function () {
			var unwatchedClass = watchIcon.getGlyphClassName(),
				watchedClass = watchedIcon.getGlyphClassName() + ' watched';

			// add tooltip to the div, not the <a> inside
			// because that <a> has zero width/height so cannot be hovered
			this.$el.attr( 'title', this.options.tooltip );

			// Add watched class if necessary
			if ( !user.isAnon() && this._watched ) {
				this.$el.addClass( watchedClass ).removeClass( unwatchedClass );
			} else {
				this.$el.addClass( unwatchedClass ).removeClass( watchedClass );
			}
			this.$el.removeClass( 'hidden' );
		},

		/**
		 * Prevent default on incoming events
		 * @memberof Watchstar
		 * @instance
		 * @param {jQuery.Event} ev
		 */
		onLinksClick: function ( ev ) {
			ev.preventDefault();
		},

		/**
		 * Triggered when a user anonymously clicks on the watchstar.
		 * @memberof Watchstar
		 * @instance
		 */
		onStatusToggleAnon: function () {
			if ( !this.drawer ) {
				this.drawer = new CtaDrawer( this.ctaDrawerOptions );

			}
			this.drawer.show();
		},

		/**
		 * Triggered when a logged in user clicks on the watchstar.
		 * @memberof Watchstar
		 * @instance
		 */
		onStatusToggleUser: function () {
			var
				self = this,
				gateway = this.gateway,
				page = this.options.page,
				checker,
				postWatched = !this._watched;

			checker = setInterval( function () {
				toast.show( mw.msg( 'mobile-frontend-watchlist-please-wait' ) );
			}, 1000 );
			function stopInterval() {
				clearInterval( checker );
			}
			gateway.postStatusesByTitle( [ page.getTitle() ], postWatched ).then( function () {
				stopInterval();

				self._watched = postWatched;
				if ( postWatched ) {
					self.render();
					/**
					 * Fired when the watch star is changed to watched status
					 * @event Watchstar#watch
					 */
					self.emit( 'watch' );
					toast.show( mw.msg( 'mobile-frontend-watchlist-add', page.title ) );
				} else {
					/**
					 * Fired when the watch star is changed to unwatched status
					 * @event Watchstar#unwatch
					 */
					self.emit( 'unwatch' );
					self.render();
					toast.show( mw.msg( 'mobile-frontend-watchlist-removed', page.title ) );
				}
			}, function () {
				stopInterval();

				toast.show( mw.msg( 'mobile-frontend-watchlist-error' ), 'error' );
			} );
		},

		/**
		 * Event handler for clicking on watch star.
		 * Make an API request if user is not anonymous.
		 * @memberof Watchstar
		 * @instance
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
