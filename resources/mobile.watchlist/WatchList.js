( function ( M ) {
	var
		PageList = M.require( 'mobile.startup/PageList' ),
		WatchstarPageList = M.require( 'mobile.pagelist.scripts/WatchstarPageList' ),
		ScrollEndEventEmitter = M.require( 'mobile.scrollEndEventEmitter/ScrollEndEventEmitter' ),
		util = M.require( 'mobile.startup/util' ),
		WatchListGateway = M.require( 'mobile.watchlist/WatchListGateway' );

	/**
	 * An extension of the WatchstarPageList which preloads pages as all being
	 * watched.
	 * @extends WatchstarPageList
	 * @class WatchList
	 * @uses ScrollEndEventEmitter
	 *
	 * @fires watched
	 * @fires watch
	 * @param {Object} options Configuration options
	 */
	function WatchList( options ) {
		var lastTitle;

		// Set up infinite scroll helper and listen to events
		this.scrollEndEventEmitter = new ScrollEndEventEmitter();
		this.scrollEndEventEmitter.on( ScrollEndEventEmitter.EVENT_SCROLL_END,
			this._loadPages.bind( this ) );

		if ( options.el ) {
			lastTitle = this.getLastTitle( options.el );
		}
		this.gateway = new WatchListGateway( options.api, lastTitle );

		WatchstarPageList.apply( this, arguments );
	}

	OO.mfExtend( WatchList, WatchstarPageList, {
		/**
		 * @memberof WatchList
		 * @instance
		 */
		isBorderBox: false,
		/**
		 * @inheritdoc
		 * @memberof WatchList
		 * @instance
		 */
		preRender: function () {
			// The DOM will be modified. Prevent any false scroll end events from
			// being emitted.
			this.scrollEndEventEmitter.disable();
			this.scrollEndEventEmitter.setElement( this.$el );
		},
		/**
		 * Also sets a watch uploads funnel.
		 * @inheritdoc
		 * @memberof WatchList
		 * @instance
		 */
		postRender: function () {
			var
				$items,
				statuses;

			// Skip a level from WatchstarPageList directly to PageList.
			PageList.prototype.postRender.apply( this );

			$items = this.queryUnitializedItems();

			// WatchList requests list of watched pages. The list contains only
			// watched pages so it's safe to transform the title map to a status map
			// with each entry marked watched (true).
			statuses = Object.keys( this.parsePagesFromItems( $items ) )
				.reduce( function ( statuses, title ) {
					statuses[ title ] = true;
					return statuses;
				}, {} );
			this.renderItems( $items, statuses );

			// The list has been extended. Re-enable scroll end events.
			this.scrollEndEventEmitter.enable();
		},

		/**
		 * Loads pages from the api and triggers render.
		 * Infinite scroll is re-enabled in postRender.
		 * @memberof WatchList
		 * @instance
		 */
		_loadPages: function () {
			this.gateway.loadWatchlist().then( function ( pages ) {
				pages.forEach( function ( page ) {
					this.appendPage( page );
				}.bind( this ) );
				this.render();
			}.bind( this ) );
		},

		/**
		 * Appends a list item
		 * @memberof WatchList
		 * @instance
		 * @param {Page} page
		 */
		appendPage: function ( page ) {
			// wikidata descriptions should not show in this view.
			var templateOptions = util.extend( {}, page.options, {
				wikidataDescription: undefined
			} );
			this.$el.append( this.templatePartials.item.render( templateOptions ) );
		},

		/**
		 * Get the last title from the rendered HTML.
		 * Used for initializing the API
		 * @memberof WatchList
		 * @instance
		 * @param {jQuery.Object} $el Dom element of the list
		 * @return {string}
		 */
		getLastTitle: function ( $el ) {
			return $el.find( 'li:last' ).attr( 'title' );
		}
	} );

	M.define( 'mobile.watchlist/WatchList', WatchList );

}( mw.mobileFrontend ) );
