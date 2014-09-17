( function( M ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var Overlay = M.require( 'Overlay' ),
		WikiGrokMoreInfo;

	/**
	 * @class WikiGrokMoreInfo
	 * @extends Overlay
	 */
	WikiGrokMoreInfo = Overlay.extend( {
		defaults: {
			heading: '<strong>About</strong>',
		},
		templatePartials: {
			content: M.template.get( 'modules/wikigrok/WikiGrokMoreInfo.hogan' )
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokMoreInfo', WikiGrokMoreInfo );
}( mw.mobileFrontend ) );
