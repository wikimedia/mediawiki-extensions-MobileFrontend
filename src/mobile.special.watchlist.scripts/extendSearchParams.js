const util = require( '../mobile.startup/util.js' ),
	actionParams = require( '../mobile.startup/actionParams.js' );

/**
 * Extends the API query parameters to include those parameters required to also fetch Wikibase
 * descriptions and appropriately sized thumbnail images as well as those required to make a query.
 *
 * This function wraps `util.extend` with some Wikibase-specific configuration
 * variable management
 * but, like `util.extend`, is variadic and so can be used as a replacement for it in search
 * gateways, e.g.
 *
 * ```
 * var params = extendSearchParams(
 *   'search',
 *   baseParams,
 *   specializedParams,
 *   moreSpecializedParams
 * );
 * ```
 *
 * @param {string} feature The name of the feature
 * @throws {Error} If `feature` isn't one that shows Wikidata descriptions. See the
 *  `wgMFDisplayWikibaseDescriptions` configuration variable for detail
 * @return {Object}
 */
module.exports = function extendSearchParams( feature ) {
	// These must be defined, as these are all the features that this can be used on.
	// If not defined, all these features will see their API calls broken
	const displayWikibaseDescriptions = mw.config.get( 'wgMFDisplayWikibaseDescriptions' ) || {
		watchlist: true
	};

	if ( !Object.prototype.hasOwnProperty.call( displayWikibaseDescriptions, feature ) ) {
		throw new Error( '"' + feature + '" isn\'t a feature that shows Wikibase descriptions.' );
	}

	// Construct the arguments for a call to `util.extend`
	// such that if it were hand-written, then it
	// would look like the following:
	//
	// ```
	// var result = util.extend( {
	//   prop: []
	// }, params, /* ..., */ mw.config.get( 'wgMFSearchAPIParams' ) );
	// ```
	const args = Array.prototype.slice.call( arguments, 1 );
	args.unshift( {
		prop: []
	} );
	args.push( mw.config.get( 'wgMFSearchAPIParams' ) );

	const result = util.extend.apply( {}, args );
	result.prop = result.prop.concat( mw.config.get( 'wgMFQueryPropModules' ) );

	if ( displayWikibaseDescriptions[feature] ) {
		if ( !result.prop.includes( 'description' ) ) {
			result.prop.push( 'description' );
		}
	}

	return actionParams( result );
};
