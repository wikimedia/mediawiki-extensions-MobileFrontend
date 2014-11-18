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
			 * @param {Number} startDate The date the test starts, specified as a Unix
			 *  timestamp
			 * @param {Number} endDate The date that the test ends, specified as a Unix
			 *  timestamp
			 */
			initialize: function ( startDate, endDate ) {
				var now = new Date().getTime() / 1000;

				this.isEnabled = startDate && endDate && ( startDate <= now && now <= endDate );
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
	 * Creates a new instance of the WikiGrokAbTest using
	 * `wfMFWikiGrokAbTestStartDate` and `wgMFWikiGrokAbTestEndDate` as the `startDate`
	 * and `endDate` parameters respectively.
	 *
	 * @return {WikiGrokAbTest}
	 */
	WikiGrokAbTest.newFromMwConfig = function () {
		var config = mw.config.get( [
			'wgMFWikiGrokAbTestStartDate',
			'wgMFWikiGrokAbTestEndDate'
		] );

		return new WikiGrokAbTest(
			config.wgMFWikiGrokAbTestStartDate,
			config.wgMFWikiGrokAbTestEndDate
		);
	};

	M.define( 'WikiGrokAbTest', WikiGrokAbTest );

}( mw.mobileFrontend, mw ) );
