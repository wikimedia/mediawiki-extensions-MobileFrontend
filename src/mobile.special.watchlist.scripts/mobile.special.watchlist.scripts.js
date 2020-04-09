/* global $ */
var WatchList = require( './WatchList' ),
	eventBus = require( '../mobile.startup/eventBusSingleton' ),
	VIEW_OPTION_NAME = 'mfWatchlistView',
	userOptions = mw.user.options.get(),
	FILTER_OPTION_NAME = 'mfWatchlistFilter';

/**
 * Initialises JavaScript on Special:Watchlist
 */
function init() {
	var $watchlist = $( 'ul.mw-mf-watchlist-page-list' );

	// FIXME: find more elegant way to not show watchlist stars on recent changes
	if ( $( '.mw-mf-watchlist-selector' ).length === 0 ) {
		// eslint-disable-next-line no-new
		new WatchList( {
			api: new mw.Api(),
			el: $watchlist,
			funnel: 'watchlist',
			skipTemplateRender: true,
			eventBus: eventBus
		} );
	}
	// not needed now we have JS view which has infinite scrolling
	$watchlist.find( '.mw-mf-watchlist-more' ).remove();
}

$( function () {
	var api = new mw.Api(),
		view = $( '.mw-mf-watchlist-button-bar .is-on a' ).data( 'view' ),
		filter = $( '.mw-mf-watchlist-selector .selected a' ).data( 'filter' );

	init();
	// Only save if the value has changed.
	if ( view !== userOptions[VIEW_OPTION_NAME] ) {
		api.saveOption( VIEW_OPTION_NAME, view );
	}
	if ( filter && filter !== userOptions[FILTER_OPTION_NAME] ) {
		api.saveOption( FILTER_OPTION_NAME, filter );
	}
} );
