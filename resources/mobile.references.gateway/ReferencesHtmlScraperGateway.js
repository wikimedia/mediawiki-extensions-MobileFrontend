( function ( M, $ ) {
	var ReferencesGateway = M.require( 'mobile.references.gateway/ReferencesGateway' );

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

	OO.mfExtend( ReferencesHtmlScraperGateway, ReferencesGateway, {
		/**
		 * @param {string} id of a DOM element in the page
		 * @param {jQuery.Object} $container to scan for an element
		 * @return {jQuery.Promise} that can be used by getReference
		 */
		getReferenceFromContainer: function ( id, $container ) {
			var $el,
				result = $.Deferred(),
				// Escape (almost) all CSS selector meta characters
				// see http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
				meta = /[!"$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g;

			id = id.replace( meta, '\\$&' );
			id = id.substr( 1, id.length );

			$el = $container.find( '#' + id );
			if ( $el.length ) {
				result.resolve( { text: $el.html() } );
			} else {
				result.reject( ReferencesGateway.ERROR_NOT_EXIST );
			}

			return result.promise();
		},
		/**
		 * @inheritdoc
		 */
		getReference: function ( id, page ) {
			return this.getReferenceFromContainer( id, page.$( 'ol.references' ) );
		}
	} );

	M.define( 'mobile.references.gateway/ReferencesHtmlScraperGateway',
		ReferencesHtmlScraperGateway );
}( mw.mobileFrontend, jQuery ) );
