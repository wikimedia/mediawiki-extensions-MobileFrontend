var PageList = require( '../PageList' ),
	Watchstar = require( './Watchstar' ),
	user = mw.user,
	util = require( '../util' ),
	Page = require( '../Page' ),
	mfExtend = require( '../mfExtend' ),
	WatchstarGateway = require( './WatchstarGateway' );

/**
 * @typedef {Object.<PageTitle, PageID>} PageTitleToPageIDMap
 */

/**
 * List of items page view
 * @class WatchstarPageList
 * @uses Page
 * @uses WatchstarGateway
 * @uses Watchstar
 * @extends PageList
 *
 * @fires WatchstarPageList#unwatch
 * @fires WatchstarPageList#watch
 * @param {Object} options Configuration options
 */
function WatchstarPageList( options ) {
	this.wsGateway = new WatchstarGateway( options.api );
	PageList.apply( this, arguments );
}

mfExtend( WatchstarPageList, PageList, {
	/**
	 * @memberof WatchstarPageList
	 * @instance
	 * @mixes PageList#defaults
	 * @property {Object} defaults Default options hash.
	 * @property {mw.Api} defaults.api
	 */

	postRender: function () {
		var
			self = this,
			$items,
			pages,
			ids = [],
			titles = [];

		PageList.prototype.postRender.apply( this );

		$items = this.queryUnitializedItems();
		pages = this.parsePagesFromItems( $items );

		Object.keys( pages ).forEach( function ( title ) {
			var id = pages[title];
			// Favor IDs since they're short and unlikely to exceed URL length
			// limits when batched.
			if ( id && id !== '0' ) {
				// ID is present and valid.
				ids.push( id );
			} else {
				// Only titles are available for missing pages.
				titles.push( title );
			}
		} );

		return this.getPages( ids, titles ).then( function ( statuses ) {
			self.renderItems( $items, statuses );
		} );
	},

	/**
	 * @param {JQuery.Element} $items
	 * @param {WatchStatusMap} statuses
	 * @return {void}
	 */
	queryUnitializedItems: function () {
		return this.$el.find( 'li:not(.with-watchstar)' );
	},

	/**
	 * Retrieve pages
	 *
	 * @memberof WatchstarPageList
	 * @instance
	 * @param {PageID[]} ids
	 * @param {PageTitle[]} titles
	 * @return {JQuery.Deferred<WatchStatusMap>}
	 */
	getPages: function ( ids, titles ) {
		// Rendering Watchstars for anonymous users is not useful. Short-circuit
		// the request.
		if ( user.isAnon() ) {
			return util.Deferred().resolve( {} );
		}

		return this.wsGateway.getStatuses( ids, titles );
	},

	/**
	 * @param {JQuery.Element} $items
	 * @return {PageTitleToPageIDMap}
	 * @memberof WatchstarPageList
	 * @instance
	 */
	parsePagesFromItems: function ( $items ) {
		var
			self = this,
			pages = {};
		$items.each( function ( _, item ) {
			var $item = self.$el.find( item );
			pages[ $item.attr( 'title' ) ] = $item.data( 'id' );
		} );
		return pages;
	},

	/**
	 * @param {JQuery.Element} $items
	 * @param {WatchStatusMap} statuses
	 * @return {void}
	 */
	renderItems: function ( $items, statuses ) {
		var self = this;

		// Rendering Watchstars for anonymous users is not useful. Nothing to do.
		if ( user.isAnon() ) {
			return;
		}

		// Create watch stars for each entry in list
		$items.each( function ( _, item ) {
			var
				$item = self.$el.find( item ),
				page = new Page( {
					// FIXME: Set sections so we don't hit the api (hacky)
					sections: [],
					title: $item.attr( 'title' ),
					id: $item.data( 'id' )
				} ),
				el = self.parseHTML( '<div>' ).appendTo( $item ),
				watched = statuses[ page.getTitle() ];

			self._appendWatchstar( el, page, watched );
			$item.addClass( 'with-watchstar' );
		} );
	},

	/**
	 * @param {HTMLElement} el
	 * @param {Page} page
	 * @param {WatchStatus} watched
	 * @return {Watchstar}
	 */
	_appendWatchstar: function ( el, page, watched ) {
		var watchstar = new Watchstar( {
			api: this.options.api,
			funnel: this.options.funnel,
			isAnon: user.isAnon(),
			// WatchstarPageList.getPages() already retrieved the status of
			// each page. Explicitly set the watch state so another request
			// will not be issued by the Watchstar.
			isWatched: watched,
			page: page,
			el: el
		} );

		/**
		 * @event watch
		 * Fired when an article in the PageList is watched.
		 */
		util.repeatEvent( watchstar, this, 'watch' );

		/**
		 * @event unwatch
		 * Fired when an article in the PageList is watched.
		 */
		util.repeatEvent( watchstar, this, 'unwatch' );

		return watchstar;
	}
} );

module.exports = WatchstarPageList;
