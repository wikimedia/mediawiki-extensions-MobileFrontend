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
		 * @inheritdoc
		 */
		getReference: function ( id, page ) {
			var ref,
				$refs = page.$( 'ol.references' ),
				$el = $refs.find( '#' + this.getEscapedId( id ) );

			ref = $el.length ?
				{
					text: $el.html()
				} : false;

			return $.Deferred().resolve( ref ).promise();
		}
	} );

	M.define( 'mobile.references.gateway/ReferencesHtmlScraperGateway',
		ReferencesHtmlScraperGateway );
}( mw.mobileFrontend, jQuery ) );
