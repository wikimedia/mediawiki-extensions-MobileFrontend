( function ( M ) {

	var Class = M.require( 'Class' ),

		/**
		 * Represents the WikiGrok A/B test.
		 *
		 * @class WikiGrokAbTest
		 * @extends Class
		 */
		WikiGrokAbTest = Class.extend( {

			/**
			 * Initialises a new instance of the WikiGrokAbTest class.
			 *
			 * @param {Boolean} isEnabled Whether or not the A/B test is enabled
			 */
			initialize: function ( isEnabled ) {
				this.isEnabled = isEnabled;
			},

			/**
			 * Gets the version of WikiGrok to show to the user.
			 *
			 * @param {Object} wikiGrokUser The WikiGrok user
			 * @return {String} `'A'` or `'B'`
			 */
			getVersion: function ( wikiGrokUser ) {
				var lastCharacter = wikiGrokUser.getToken().slice( -1 );

				return lastCharacter > 'U' ? 'B' : 'A';
			}
		} );

	/**
	 * Creates a new instance of the WikiGrokAbTest using `wgMFEnableWikiGrok` as
	 * the `isEnabled` parameter.
	 *
	 * @return {WikiGrokAbTest}
	 */
	WikiGrokAbTest.newFromMwConfig = function () {
		return new WikiGrokAbTest( mw.config.get( 'wgMFEnableWikiGrok' ) );
	};

	M.define( 'WikiGrokAbTest', WikiGrokAbTest );

}( mw.mobileFrontend, mw ) );
