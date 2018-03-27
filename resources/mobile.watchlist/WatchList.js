( function ( M ) {
	var WatchstarPageList = M.require( 'mobile.pagelist.scripts/WatchstarPageList' ),
		InfiniteScroll = M.require( 'mobile.infiniteScroll/InfiniteScroll' ),
		util = M.require( 'mobile.startup/util' ),
		WatchListGateway = M.require( 'mobile.watchlist/WatchListGateway' );

	/**
	 * An extension of the PageList which preloads pages as all being watched.
	 * @extends PageList
	 * @class WatchList
	 * @uses InfiniteScroll
	 *
	 * @constructor
	 * @param {Object} options Configuration options
	 */
	function WatchList( options ) {
		var lastTitle;

		// Set up infinite scroll helper and listen to events
		this.infiniteScroll = new InfiniteScroll();
		this.infiniteScroll.on( 'load', this._loadPages.bind( this ) );

		if ( options.el ) {
			lastTitle = this.getLastTitle( options.el );
		}
		this.gateway = new WatchListGateway( options.api, lastTitle );

		WatchstarPageList.apply( this, arguments );
	}

	OO.mfExtend( WatchList, WatchstarPageList, {
		isBorderBox: false,
		/** @inheritdoc */
		preRender: function () {
			this.infiniteScroll.disable();
			this.infiniteScroll.setElement( this.$el );
		},
		/**
		 * Retrieve pages where all pages are watched.
		 *
		 * @method
		 * @param {Array} ids a list of page ids
		 * @return {jQuery.Deferred}
		 */
		getPages: function ( ids ) {
			return this.wsGateway.loadWatchStatus( ids, true );
		},
		/**
		 * Also sets a watch uploads funnel.
		 * @inheritdoc
		 */
		postRender: function () {
			WatchstarPageList.prototype.postRender.apply( this );
			this.infiniteScroll.enable();
			this.$( '.page-summary .info' ).css( 'visibility', 'visible' );
		},
		/**
		 * Loads pages from the api and triggers render.
		 * Infinite scroll is re-enabled in postRender.
		 */
		_loadPages: function () {
			this.gateway.loadWatchlist().done( function ( pages ) {
				pages.forEach( function ( page ) {
					this.appendPage( page );
				}.bind( this ) );
				this.render();
			}.bind( this ) );
		},

		/**
		 * Appends a list item
		 * @param {Object} page
		 */
		appendPage: function ( page ) {
			// wikidata descriptions should not show in this view.c
			var templateOptions = util.extend( {}, page.options, {
				wikidataDescription: undefined
			} );
			this.$el.append( this.templatePartials.item.render( templateOptions ) );
		},

		/**
		 * Get the last title from the rendered HTML.
		 * Used for initializing the API
		 * @param {jQuery.Object} $el Dom element of the list
		 * @return {string}
		 */
		getLastTitle: function ( $el ) {
			return $el.find( 'li:last' ).attr( 'title' );
		}

	} );

	M.define( 'mobile.watchlist/WatchList', WatchList );

}( mw.mobileFrontend ) );
