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
		 * @param {String} id of a DOM element in the page
		 * @param {jQuery.Object} $container to scan for an element
		 * @return {jQuery.Promise} that can be used by getReference
		 */
		getReferenceFromContainer: function ( id, $container ) {
			var $el, ref,
				// Escape (almost) all CSS selector meta characters
				// see http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
				meta = /[!"$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g;

			id = id.replace( meta, '\\$&' );
			id = id.substr( 1, id.length );

			$el = $container.find( '#' + id );
			ref = $el.length ?
				{
					text: $el.html()
				} : false;

			return $.Deferred().resolve( ref ).promise();
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
