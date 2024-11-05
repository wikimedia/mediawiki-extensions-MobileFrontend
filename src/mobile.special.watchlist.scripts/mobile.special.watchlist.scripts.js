/* global $ */
const WatchList = require( './WatchList' ),
	eventBus = require( '../mobile.startup/eventBusSingleton' );

/**
 * Initialises JavaScript on Special:Watchlist
 *
 * @private
 */
function init() {
	const $watchlist = $( 'ul.mw-mf-watchlist-page-list' );

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

$( () => {
	init();
} );
