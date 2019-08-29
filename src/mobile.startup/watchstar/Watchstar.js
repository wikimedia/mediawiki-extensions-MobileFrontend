var View = require( '../View' ),
	WatchstarGateway = require( './WatchstarGateway' ),
	icons = require( '../icons' ),
	util = require( '../util' ),
	mfExtend = require( '../mfExtend' ),
	toast = require( '../toast' ),
	CtaDrawer = require( '../CtaDrawer' );

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
function Watchstar( options ) {
	View.call(
		this,
		util.extend(
			true,
			{
				className: icons.watchIcon().getClassName(),
				events: {
					click: 'onStatusToggle'
				}
			},
			options
		)
	);
}

mfExtend( Watchstar, View, {
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
		this.options.tooltip = this._watched ? mw.msg( 'unwatch' ) : mw.msg( 'watch' );
	},
	/**
	 * @inheritdoc
	 * @memberof Watchstar
	 * @instance
	 */
	postRender: function () {
		var unwatchedClass = icons.watchIcon().getGlyphClassName(),
			watchedClass = icons.watchedIcon().getGlyphClassName() + ' watched';

		this.$el.text( this.options.tooltip );

		// Add watched class if necessary
		if ( !mw.user.isAnon() && this._watched ) {
			this.$el.addClass( watchedClass ).removeClass( unwatchedClass );
		} else {
			this.$el.addClass( unwatchedClass ).removeClass( watchedClass );
		}
		this.$el.removeClass( 'hidden' );
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

			toast.show( mw.msg( 'mobile-frontend-watchlist-error' ), { type: 'error' } );
		} );
	},

	/**
	 * Event handler for clicking on watch star.
	 * Make an API request if user is not anonymous.
	 * @memberof Watchstar
	 * @instance
	 * @param {jQuery.Event} ev jQuery event object
	 */
	onStatusToggle: function ( ev ) {
		ev.preventDefault();
		if ( mw.user.isAnon() ) {
			this.onStatusToggleAnon.apply( this, arguments );
		} else {
			this.onStatusToggleUser.apply( this, arguments );
		}
	}

} );

module.exports = Watchstar;
