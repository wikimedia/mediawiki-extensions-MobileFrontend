( function( M ) {

	var View = M.require( 'View' ), Watchstar,
		WatchstarApi = M.require( 'modules/watchstar/WatchstarApi' ),
		toast = M.require( 'toast' ),
		user = M.require( 'user' ),
		api = new WatchstarApi(),
		CtaDrawer = M.require( 'CtaDrawer' );

	/**
	 * A clickable watchstar
	 * @class Watchstar
	 * @extends View
	 */
	Watchstar = View.extend( {
		defaults: {
			page: M.getCurrentPage()
		},
		tagName: 'div',
		className: 'icon icon-32px watch-this-article',
		template: M.template.compile( '<a>' ),
		initialize: function( options ) {
			var self = this, _super = this._super,
				page = options.page;

			this.drawer = new CtaDrawer( {
				content: mw.msg( 'mobile-frontend-watchlist-cta' ),
				queryParams: {
					campaign: 'mobile_watchPageActionCta',
					returntoquery: 'article_action=watch'
				}
			} );

			if ( user.isAnon() ) {
				this._super( options );
			} else if ( options.isWatched === undefined ) {
				api.load( page.getId() ).done( function() {
					options.isWatched = api.isWatchedPage( page );
					_super.call( self, options );
				} );
			} else {
				api.setWatchedPage( options.page, options.isWatched );
				this._super( options );
			}
		},
		postRender: function( options ) {
			var self = this, callback,
				page = options.page,
				$el = self.$el;

			callback = function() {
				if ( user.isAnon() ) {
					self.drawer.show();
				} else {
					$el.addClass( 'loading' );
					api.toggleStatus( page ).always( function() {
						$el.removeClass( 'loading' );
					} ).done( function() {
						if ( api.isWatchedPage( page ) ) {
							$el.addClass( 'watched' );
							toast.show( mw.msg( 'mobile-frontend-watchlist-add', page.title ) );
						} else {
							$el.removeClass( 'watched' );
							toast.show( mw.msg( 'mobile-frontend-watchlist-removed', page.title ) );
						}
					} );
				}
			};
			this.$el.on( 'click', callback );
			// Disable clicks on original link
			this.$( 'a' ).on( 'click', function( ev ) {
				ev.preventDefault();
			} );

			// Add watched class if necessary
			if ( !user.isAnon() && api.isWatchedPage( page ) ) {
				$el.addClass( 'watched' );
			}
		}
	} );

	M.define( 'modules/watchstar/Watchstar', Watchstar );

}( mw.mobileFrontend ) );
