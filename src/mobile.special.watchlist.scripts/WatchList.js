const
	mfExtend = require( '../mobile.startup/mfExtend' ),
	PageList = require( '../mobile.startup/PageList' ),
	WatchstarPageList = require( '../mobile.startup/watchstar/WatchstarPageList' ),
	ScrollEndEventEmitter = require( './ScrollEndEventEmitter' ),
	util = require( '../mobile.startup/util' ),
	WatchListGateway = require( './WatchListGateway' );

/**
 * An extension of the WatchstarPageList which preloads pages as all being
 * watched.
 *
 * @extends WatchstarPageList
 * @class WatchList
 * @uses ScrollEndEventEmitter
 *
 * @fires watched
 * @fires watch
 * @param {Object} params Configuration options
 * @param {OO.EventEmitter} params.eventBus Object used to listen for scroll:throttled events
 * @private
 */
function WatchList( params ) {
	let lastTitle;
	const options = util.extend(
		{},
		{
			isBorderBox: false
		},
		params
	);

	// Set up infinite scroll helper and listen to events
	this.scrollEndEventEmitter = new ScrollEndEventEmitter( options.eventBus );
	this.scrollEndEventEmitter.on( ScrollEndEventEmitter.EVENT_SCROLL_END,
		this._loadPages.bind( this ) );

	if ( options.el ) {
		lastTitle = this.getLastTitle( options.el );
	}
	this.gateway = new WatchListGateway( options.api, lastTitle );

	WatchstarPageList.call( this, options );
}

mfExtend( WatchList, WatchstarPageList, {
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
	 *
	 * @inheritdoc
	 * @memberof WatchList
	 * @instance
	 */
	postRender: function () {
		// Skip a level from WatchstarPageList directly to PageList.
		PageList.prototype.postRender.apply( this );

		const $items = this.queryUnitializedItems();

		// WatchList requests list of watched pages. The list contains only
		// watched pages so it's safe to transform the title map to a status map
		// with each entry marked watched (true).
		const statuses = Object.keys( this.parsePagesFromItems( $items ) )
			.reduce( ( arr, title ) => {
				arr[ title ] = true;
				return arr;
			}, {} );
		this.renderItems( $items, statuses );

		// The list has been extended. Re-enable scroll end events.
		this.scrollEndEventEmitter.enable();
	},

	/**
	 * Loads pages from the api and triggers render.
	 * Infinite scroll is re-enabled in postRender.
	 *
	 * @memberof WatchList
	 * @instance
	 */
	_loadPages: function () {
		this.gateway.loadWatchlist().then( ( pages ) => {
			pages.forEach( ( page ) => {
				this.appendPage( page );
			} );
			this.render();
		} );
	},

	/**
	 * Appends a list item
	 *
	 * @memberof WatchList
	 * @instance
	 * @param {Page} page
	 */
	appendPage: function ( page ) {
		// wikidata descriptions should not show in this view.
		const templateOptions = util.extend( {}, page, {
			wikidataDescription: undefined
		} );
		this.$el.append( this.templatePartials.item.render( templateOptions ) );
	},

	/**
	 * Get the last title from the rendered HTML.
	 * Used for initializing the API
	 *
	 * @memberof WatchList
	 * @instance
	 * @param {jQuery.Object} $el Dom element of the list
	 * @return {string}
	 */
	getLastTitle: function ( $el ) {
		return $el.find( 'li' ).last().attr( 'title' );
	}
} );

module.exports = WatchList;
