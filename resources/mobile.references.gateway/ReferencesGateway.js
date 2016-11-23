( function ( M ) {
	/**
	 * Abstract base class
	 * Gateway for retrieving references
	 *
	 * @class ReferencesGateway
	 * @abstract
	 * @param {mw.Api} api
	 */
	function ReferencesGateway( api ) {
		this.api = api;
	}

	OO.mfExtend( ReferencesGateway, {
		/**
		 * Return the matched reference via API or DOM query
		 *
		 * @method
		 * @param {String} id CSS selector
		 * @param {Page} page to find reference for
		 * @return {jQuery.Promise} resolves with an Object representing reference with a `text` property
		 *  or false if the reference does not exist
		 */
		getReference: function () {
			throw new Error( 'Method unimplemented' );
		}
	} );

	M.define( 'mobile.references.gateway/ReferencesGateway', ReferencesGateway );
}( mw.mobileFrontend ) );
