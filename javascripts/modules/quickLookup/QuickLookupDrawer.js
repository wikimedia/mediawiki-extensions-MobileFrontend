( function ( M, $ ) {
	var Icon = M.require( 'Icon' ),
		Drawer = M.require( 'Drawer' ),
		user = M.require( 'user' ),
		Page = M.require( 'Page' ),
		QuickLookupDrawer;

	/**
	 * Drawer for showing a brief information about a page.
	 * If the user is logged in, the user will see a watchstar too so that they
	 * can (un)watch the page.
	 * @inheritdoc
	 * @class QuickLookupDrawer
	 * @extends Drawer
	 */
	QuickLookupDrawer = Drawer.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.cancelButton HTML of the button that closes the drawer.
		 * @cfg {String} defaults.title title of the page
		 * @cfg {String} defaults.text text of the page
		 * @cfg {String} defaults.id ID of the page
		 */
		defaults: {
			cancelButton: new Icon( {
				tagName: 'a',
				name: 'cancel-light',
				additionalClassNames: 'cancel',
				label: mw.msg( 'mobile-frontend-overlay-close' )
			} ).toHtmlString(),
			title: '',
			text: '',
			id: ''
		},
		/**
		 * @inheritdoc
		 */
		className: Drawer.prototype.className + ' quick-lookup',
		/**
		 * @inheritdoc
		 */
		template: mw.template.get( 'mobile.quickLookup', 'Drawer.hogan' ),
		/**
		 * @inheritdoc
		 */
		closeOnScroll: false,
		/**
		 * @inheritdoc
		 */
		postRender: function ( options ) {
			var self = this,
				windowHeight = $( window ).height();

			Drawer.prototype.postRender.apply( this, arguments );

			// make sure the drawer doesn't take up more than 50% of the viewport height
			if ( windowHeight / 2 < 400 ) {
				this.$el.css( 'max-height', windowHeight / 2 );
			}

			this.on( 'show', $.proxy( this, 'onShow' ) );
			this.on( 'hide', $.proxy( this, 'onHide' ) );

			// add watchstar
			if ( !user.isAnon() ) {
				mw.loader.using( 'mobile.watchstar', function () {
					var Watchstar = M.require( 'modules/watchstar/Watchstar' ),
						WatchstarApi = M.require( 'modules/watchstar/WatchstarApi' ),
						watchstarApi,
						page;

					watchstarApi = new WatchstarApi();
					watchstarApi.load( [ options.id ], false ).done( function () {
						page = new Page( {
							sections: [],  // Set sections so we don't hit the api (hacky)
							title: options.title,
							id: options.id
						} );

						new Watchstar( {
							isAnon: false,
							isWatched: watchstarApi.isWatchedPage( page ),
							page: page,
							el: $( '<a>' ).insertBefore( self.$el.find( 'h3' ) )
						} );
					} );
				} );
			}
		},
		/**
		 * Make body not scrollable
		 */
		onShow: function () {
			$( 'body' ).addClass( 'drawer-enabled' );
		},
		/**
		 * Restore body scroll
		 */
		onHide: function () {
			$( 'body' ).removeClass( 'drawer-enabled' );
			this.$el.detach();
		}
	} );

	M.define( 'modules/quickLookup/QuickLookupDrawer', QuickLookupDrawer );
}( mw.mobileFrontend, jQuery ) );
