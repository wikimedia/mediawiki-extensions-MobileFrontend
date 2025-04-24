const
	PageList = require( './PageList' ),
	WatchstarPageList = require( './WatchstarPageList' ),
	ScrollEndEventEmitter = require( './ScrollEndEventEmitter' ),
	util = require( '../mobile.startup/util' ),
	WatchListGateway = require( './WatchListGateway' );

/**
 * An extension of the WatchstarPageList which preloads pages as all being
 * watched.
 *
 * @uses ScrollEndEventEmitter
 *
 * @fires watched
 * @fires watch
 * @private
 */
class WatchList extends WatchstarPageList {
	/**
	 * @param {Object} params Configuration options
	 * @param {OO.EventEmitter} params.eventBus Object used to listen for scroll:throttled events
	 */
	constructor( params ) {
		super( util.extend(
			{},
			{
				isBorderBox: false
			},
			params
		) );
	}

	initialize( options ) {
		// Set up infinite scroll helper and listen to events
		this.scrollEndEventEmitter = new ScrollEndEventEmitter( options.eventBus );
		this.scrollEndEventEmitter.on( ScrollEndEventEmitter.EVENT_SCROLL_END,
			() => this._loadPages() );

		let lastTitle;
		if ( options.el ) {
			lastTitle = this.getLastTitle( options.el );
		}
		this.gateway = new WatchListGateway( options.api, lastTitle );
		super.initialize( options );
	}

	preRender() {
		// The DOM will be modified. Prevent any false scroll end events from
		// being emitted.
		this.scrollEndEventEmitter.disable();
		this.scrollEndEventEmitter.setElement( this.$el );
	}

	/**
	 * Also sets a watch uploads funnel.
	 *
	 * @inheritdoc
	 */
	postRender() {
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
	}

	/**
	 * Loads pages from the api and triggers render.
	 * Infinite scroll is re-enabled in postRender.
	 *
	 */
	_loadPages() {
		this.gateway.loadWatchlist().then( ( pages ) => {
			pages.forEach( ( page ) => {
				this.appendPage( page );
			} );
			this.render();
		} );
	}

	/**
	 * Appends a list item
	 *
	 * @param {Page} page
	 */
	appendPage( page ) {
		// wikidata descriptions should not show in this view.
		const templateOptions = util.extend( {}, page, {
			wikidataDescription: undefined
		} );
		this.$el.append( this.templatePartials.item.render( templateOptions ) );
	}

	/**
	 * Get the last title from the rendered HTML.
	 * Used for initializing the API
	 *
	 * @param {jQuery.Object} $el Dom element of the list
	 * @return {string}
	 */
	getLastTitle( $el ) {
		return $el.find( 'li' ).last().attr( 'title' );
	}
}

module.exports = WatchList;
