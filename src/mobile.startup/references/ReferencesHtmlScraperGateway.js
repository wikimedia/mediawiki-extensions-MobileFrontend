var ReferencesGateway = require( './ReferencesGateway' ),
	mfExtend = require( './../mfExtend' ),
	util = require( './../util' );

/**
 * Gateway for retrieving references via the content of the Page
 *
 * @class ReferencesHtmlScraperGateway
 * @extends ReferencesGateway
 * @inheritdoc
 */
function ReferencesHtmlScraperGateway() {
	ReferencesGateway.apply( this, arguments );
}

mfExtend( ReferencesHtmlScraperGateway, ReferencesGateway, {
	/**
	 * @memberof ReferencesHtmlScraperGateway
	 * @instance
	 * @param {string} id of a DOM element in the page with '#' prefix.
	 *  can be encoded or decoded.
	 * @param {jQuery.Object} $container to scan for an element
	 * @return {jQuery.Promise} that can be used by getReference
	 */
	getReferenceFromContainer: function ( id, $container ) {
		var $el,
			result = util.Deferred();

		$el = $container.find( '#' + util.escapeSelector( id.substr( 1 ) ) );
		if ( $el.length ) {
			result.resolve( { text: $el.html() } );
		} else {
			result.reject( ReferencesGateway.ERROR_NOT_EXIST );
		}
		return result.promise();
	},
	/**
	 * @inheritdoc
	 * @memberof ReferencesHtmlScraperGateway
	 * @instance
	 */
	getReference: function ( id, page ) {
		// If an id is not found it's possible the id passed needs decoding (per T188547).
		return this.getReferenceFromContainer( decodeURIComponent( id ), page.$el.find( 'ol.references' ) );
	}
} );

module.exports = ReferencesHtmlScraperGateway;
