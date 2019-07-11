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
	 * @property EXTERNAL_LINK_CLASS a CSS class to place on external links
	 * in addition to the default 'external' class.
	 */
	EXTERNAL_LINK_CLASS: 'external--reference',
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
			$el.find( '.external' ).addClass( this.EXTERNAL_LINK_CLASS );
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
	 * @param {string} id
	 * @param {Page} page
	 * @param {PageHTMLParser} pageHTMLParser
	 */
	getReference: function ( id, page, pageHTMLParser ) {
		// If an id is not found it's possible the id passed needs decoding (per T188547).
		return this.getReferenceFromContainer( decodeURIComponent( id ), pageHTMLParser.$el.find( 'ol.references' ) );
	}
} );

module.exports = ReferencesHtmlScraperGateway;
