const PageList = require( '../PageList' ),
	watchstar = require( './watchstar' ),
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
 *
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
	postRender() {
		const
			self = this,
			ids = [],
			titles = [];

		PageList.prototype.postRender.apply( this );

		const $items = this.queryUnitializedItems();
		const pages = this.parsePagesFromItems( $items );

		Object.keys( pages ).forEach( ( title ) => {
			const id = pages[title];
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

		return this.getPages( ids, titles )
			.then( ( statuses ) => self.renderItems( $items, statuses ) );
	},

	/**
	 * @param {jQuery.Element} $items
	 * @param {WatchStatusMap} statuses
	 */
	queryUnitializedItems() {
		return this.$el.find( 'li:not(.with-watchstar)' );
	},

	/**
	 * Retrieve pages
	 *
	 * @memberof WatchstarPageList
	 * @instance
	 * @param {PageID[]} ids
	 * @param {PageTitle[]} titles
	 * @return {jQuery.Deferred<WatchStatusMap>}
	 */
	getPages( ids, titles ) {
		// Rendering Watchstars for anonymous users is not useful. Short-circuit
		// the request.
		if ( user.isAnon() ) {
			return util.Deferred().resolve( {} );
		}

		return this.wsGateway.getStatuses( ids, titles );
	},

	/**
	 * @param {jQuery.Element} $items
	 * @return {PageTitleToPageIDMap}
	 * @memberof WatchstarPageList
	 * @instance
	 */
	parsePagesFromItems( $items ) {
		const
			self = this,
			pages = {};
		$items.each( ( _, item ) => {
			const $item = self.$el.find( item );
			pages[$item.attr( 'title' )] = $item.data( 'id' );
		} );
		return pages;
	},

	/**
	 * @param {jQuery.Element} $items
	 * @param {WatchStatusMap} statuses
	 */
	renderItems( $items, statuses ) {
		const self = this;

		// Rendering Watchstars for anonymous users is not useful. Nothing to do.
		if ( user.isAnon() ) {
			return;
		}

		// Create watch stars for each entry in list
		$items.each( ( _, item ) => {
			const
				$item = self.$el.find( item ),
				page = new Page( {
					// FIXME: Set sections so we don't hit the api (hacky)
					sections: [],
					title: $item.attr( 'title' ),
					id: $item.data( 'id' )
				} ),
				watched = statuses[page.getTitle()];

			self._appendWatchstar( $item, page, watched );
			$item.addClass( 'with-watchstar' );
		} );
	},

	/**
	 * @param {jQuery.Object} $item
	 * @param {Page} page
	 * @param {WatchStatus} watched
	 */
	_appendWatchstar( $item, page, watched ) {
		watchstar( {
			// WatchstarPageList.getPages() already retrieved the status of
			// each page. Explicitly set the watch state so another request
			// will not be issued by the Watchstar.
			isWatched: watched,
			page
		} ).appendTo( $item );
	}
} );

module.exports = WatchstarPageList;
