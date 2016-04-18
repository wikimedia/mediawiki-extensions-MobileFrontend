( function ( M ) {
	/**
	 * Abstract base class
	 * Gateway for retrieving references
	 *
	 * @class ReferencesGateway
	 * @param {mw.Api} api
	 */
	function ReferencesGateway( api ) {
		this.api = api;
	}

	OO.mfExtend( ReferencesGateway, {
		/**
		 * Escapes reference id to remove CSS selector meta characters
		 *
		 * @param {String} id of a DOM element in the page
		 * @returns {String}
		 */
		getEscapedId: function ( id ) {
			var
				// Escape (almost) all CSS selector meta characters
				// see http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
				meta = /[!"$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g;

			id = id.replace( meta, '\\$&' );
			return id.substr( 1, id.length );
		},
		// jscs:disable
		/**
		 * Return the matched reference via API or DOM query
		 *
		 * @method
		 * @param {String} id CSS selector
		 * @param {Page} page to find reference for
		 * @returns {jQuery.Promise} resolves with an Object representing reference with a `text` property
			  or false if the reference does not exist
		 */
		getReference: function () {
			throw new Error( 'Method unimplemented' );
		}
		// jscs:enable
	} );

	M.define( 'mobile.references.gateway/ReferencesGateway', ReferencesGateway );
}( mw.mobileFrontend ) );
