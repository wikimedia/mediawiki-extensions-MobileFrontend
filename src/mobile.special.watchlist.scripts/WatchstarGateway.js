const util = require( '../mobile.startup/util' ),
	actionParams = require( '../mobile.startup/actionParams' );

/**
 * @ignore
 * @typedef {string|number} PageID Page ID. 0 / "0" is a special no-ID value.
 * {@link https://www.mediawiki.org/wiki/Manual:Page_table#page_id Page ID}
 *
 * @ignore
 * @typedef {string} PageTitle Canonical page title.
 * {@link https://www.mediawiki.org/wiki/Manual:Title.php#Canonical_forms Canonical forms}
 *
 * @ignore
 * @typedef {boolean} WatchStatus Page watch status; true if watched, false if
 *                                unwatched.
 * {@link https://www.mediawiki.org/wiki/API:Info API:Info} (see inprop.watched)
 * {@link https://www.mediawiki.org/wiki/API:Watch API:Watch} (see unwatch)
 *
 * @ignore
 * @typedef {Object.<PageTitle, WatchStatus>} WatchStatusMap
 */

/**
 * API for retrieving and modifying page watch statuses. This module interacts
 * with two endpoints, API:Info for GETs and API:Watch and for POSTs.
 */
class WatchstarGateway {
	/**
	 * @param {mw.Api} api
	 */
	constructor( api ) {
		this.api = api;
	}

	/**
	 * Issues zero to two asynchronous HTTP requests for the watch status of
	 * each page ID and title passed.
	 *
	 * Every watch entry has a title but not necessarily a page ID. Entries
	 * without IDs are missing pages, i.e., pages that do not exist. These
	 * entries are used to observe when a page with a given title is created.
	 * Although it is convenient to use titles because they're always present,
	 * IDs are preferred since they're far less likely to exceed the URL length
	 * limit.
	 *
	 * No request is issued when no IDs and no titles are passed. Given that the
	 * server state does not change between the two requests, overlapping title
	 * and ID members will behave as expected but there is no reason to issue
	 * such a request.
	 *
	 * @param {PageID[]} ids
	 * @param {PageTitle[]} titles
	 * @return {jQuery.Deferred<WatchStatusMap>}
	 */
	getStatuses( ids, titles ) {
		// Issue two requests and coalesce the results.
		return util.Promise.all( [
			this.getStatusesByID( ids ),
			this.getStatusesByTitle( titles )
		] ).then( function () {
			return util.extend.apply( util, arguments );
		} );
	}

	/**
	 * @param {PageID[]} ids
	 * @return {jQuery.Deferred<WatchStatusMap>}
	 */
	getStatusesByID( ids ) {
		if ( !ids.length ) {
			return util.Deferred().resolve( {} );
		}

		return this.api.get( {
			formatversion: 2,
			action: 'query',
			prop: 'info',
			inprop: 'watched',
			pageids: ids
		} ).then( ( rsp ) => this._unmarshalGetResponse( rsp ) );
	}

	/**
	 * @param {PageTitle[]} titles
	 * @return {jQuery.Deferred<WatchStatusMap>}
	 */
	getStatusesByTitle( titles ) {
		if ( !titles.length ) {
			return util.Deferred().resolve( {} );
		}

		return this.api.get( actionParams( {
			prop: 'info',
			inprop: 'watched',
			titles
		} ) ).then( ( rsp ) => this._unmarshalGetResponse( rsp ) );
	}

	/**
	 * @param {PageTitle[]} titles
	 * @param {WatchStatus} watched
	 * @return {jQuery.Deferred}
	 */
	postStatusesByTitle( titles, watched ) {
		const params = {
			action: 'watch',
			titles
		};
		if ( !watched ) {
			params.unwatch = !watched;
		}
		return this.api.postWithToken( 'watch', params );
	}

	/**
	 * @param {Object} rsp The API:Info response.
	 * @return {jQuery.Deferred<WatchStatusMap>}
	 * @see getStatusesByID
	 * @see getStatusesByTitle
	 * @ignore
	 */
	_unmarshalGetResponse( rsp ) {
		const pages = rsp && rsp.query && rsp.query.pages || [];
		return pages.reduce( ( statuses, page ) => {
			statuses[page.title] = page.watched;
			return statuses;
		}, {} );
	}
}

module.exports = WatchstarGateway;
