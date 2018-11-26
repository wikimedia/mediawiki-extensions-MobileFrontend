var ReferencesHtmlScraperGateway =
	require( './ReferencesHtmlScraperGateway' ),
	cache = require( './../cache' ),
	ReferencesGateway = require( './ReferencesGateway' ),
	MemoryCache = cache.MemoryCache,
	util = require( './../util' ),
	mfExtend = require( './../mfExtend' ),
	NoCache = cache.NoCache,
	referencesMobileViewGateway = null;

/**
 * Gateway for retrieving references via the MobileView API
 *
 * By default not cached, if it receives a cache instance then it will be
 * used to store and get references sections.
 *
 * @class ReferencesMobileViewGateway
 * @extends ReferencesHtmlScraperGateway
 * @inheritdoc
 *
 * @param {mw.Api} api class to use for making requests
 * @param {NoCache|MemoryCache} [cache] class to use for caching request
 * results. By default it uses the NoCache implementation, which doesn't
 * cache anything. The singleton instance exposed by this module uses
 * a MemoryCache which caches requests in-memory. Any other Cache class
 * compatible with mobile.startup/cache's interface will actually work.
 */
function ReferencesMobileViewGateway( api, cache ) {
	ReferencesHtmlScraperGateway.call( this, api );
	this.cache = cache || new NoCache();
}

mfExtend( ReferencesMobileViewGateway, ReferencesHtmlScraperGateway, {
	/**
	 * Retrieve references list for a given page.
	 * Also cache the result for a later use.
	 *
	 * @memberof ReferencesMobileViewGateway
	 * @instance
	 * @param {Page} page
	 * @return {jQuery.Deferred} promise that resolves with the list of
	 *  sections on the page
	 */
	getReferencesLists: function ( page ) {
		var self = this,
			result = util.Deferred(),
			cachedReferencesSections = this.cache.get( page.id );

		if ( cachedReferencesSections ) {
			return result.resolve( cachedReferencesSections ).promise();
		}

		this.api.get( {
			action: 'mobileview',
			page: page.getTitle(),
			sections: 'references',
			prop: 'text',
			revision: page.getRevisionId()
		} ).then( function ( data ) {
			var sections = {};

			data.mobileview.sections.forEach( function ( section ) {
				var $section = util.parseHTML( '<div>' ).html( section.text );

				sections[ $section.find( '.mw-headline' ).attr( 'id' ) ] = $section.find( '.references' );
			} );

			self.cache.set( page.id, sections );
			result.resolve( sections );
		}, function () {
			result.reject( ReferencesGateway.ERROR_OTHER );
		} );

		return result.promise();
	},
	/**
	 * Retrieve all the references lists for a given page and section ID.
	 *
	 * @memberof ReferencesMobileViewGateway
	 * @instance
	 * @param {Page} page
	 * @param {string} headingId
	 * @return {jQuery.Promise} promise that resolves with the section
	 *  HTML or `false` if no such section exists
	 */
	getReferencesList: function ( page, headingId ) {
		return this.getReferencesLists( page ).then( function ( data ) {
			return Object.prototype.hasOwnProperty.call( data, headingId ) ?
				data[ headingId ] : false;
		} );
	},
	/**
	 * @inheritdoc
	 * @memberof ReferencesMobileViewGateway
	 * @instance
	 */
	getReference: function ( id, page ) {
		var self = this;

		return this.getReferencesLists( page ).then( function ( sections ) {
			var $container = util.parseHTML( '<div>' );

			Object.keys( sections ).forEach( function ( sectionId ) {
				$container.append( sections[ sectionId ] );
			} );

			return self.getReferenceFromContainer( id, $container );
		} );
	}
} );

/**
 * Retrieve a singleton instance w/ cache that uses mw.Api
 * @memberof ReferencesMobileViewGateway
 * @return {ReferencesMobileViewGateway}
 */
ReferencesMobileViewGateway.getSingleton = function () {
	if ( !referencesMobileViewGateway ) {
		referencesMobileViewGateway = new ReferencesMobileViewGateway(
			new mw.Api(),
			new MemoryCache()
		);
	}
	return referencesMobileViewGateway;
};

module.exports = ReferencesMobileViewGateway;
