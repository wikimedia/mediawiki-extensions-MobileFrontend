( function( M ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var WikiGrokDialog = M.require( 'modules/wikigrok/WikiGrokDialog' ),
		WikiGrokDialogB;

	/**
	 * @class WikiGrokDialog
	 * @extends InlineDialog
	 * THIS IS AN EXPERIMENTAL FEATURE THAT MAY BE MOVED TO A SEPARATE EXTENSION.
	 * This creates the dialog at the bottom of the lead section that appears when a user
	 * scrolls past the lead. It asks the user to confirm metadata information for use
	 * in Wikidata (https://www.wikidata.org).
	 */
	WikiGrokDialogB = WikiGrokDialog.extend( {
		version: 'b',
		defaults: {
			headerMsg: ''
		},
		postRender: function( options ) {
			console.log( this );
			this.askWikidataQuestion( options );
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokDialogB', WikiGrokDialogB );
}( mw.mobileFrontend ) );
