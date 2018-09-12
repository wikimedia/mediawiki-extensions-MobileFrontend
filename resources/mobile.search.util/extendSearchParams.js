( function ( M ) {
	var util = M.require( 'mobile.startup/util' );

	/**
	 * Extends the API query parameters to include those parameters required to also fetch Wikibase
	 * descriptions and appropriately sized thumbnail images.
	 *
	 * This function wraps `util.extend` with some Wikibase-specific configuration
	 * variable management
	 * but, like `util.extend`, is variadic and so can be used as a replacement for it in search
	 * gateways, e.g.
	 *
	 * ```
	 * var params = extendSearchParams(
	 *   'nearby',
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
	function extendSearchParams( feature ) {
		var displayWikibaseDescriptions = mw.config.get( 'wgMFDisplayWikibaseDescriptions', {} ),
			args,
			result;

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
		args = Array.prototype.slice.call( arguments, 1 );
		args.unshift( {
			prop: []
		} );
		args.push( mw.config.get( 'wgMFSearchAPIParams' ) );

		result = util.extend.apply( {}, args );
		result.prop = result.prop.concat( mw.config.get( 'wgMFQueryPropModules' ) );

		if ( displayWikibaseDescriptions[feature] ) {
			if ( result.prop.indexOf( 'description' ) === -1 ) {
				result.prop.push( 'description' );
			}
		}

		return result;
	}

	M.define( 'mobile.search.util/extendSearchParams', extendSearchParams );

}( mw.mobileFrontend ) );
