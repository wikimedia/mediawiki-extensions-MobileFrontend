( function ( M ) {
	M.assertMode( [ 'beta', 'alpha' ] );

	var Overlay = M.require( 'Overlay' ),
		WikiGrokMoreInfo;

	/**
	 * Show more info about the wikigrok
	 * @class WikiGrokMoreInfo
	 * @extends Overlay
	 */
	WikiGrokMoreInfo = Overlay.extend( {
		defaults: {
			heading: '<strong>About</strong>'
		},
		templatePartials: {
			content: mw.template.get( 'mobile.wikigrok.dialog', 'WikiGrokMoreInfo/content.hogan' )
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokMoreInfo', WikiGrokMoreInfo );
}( mw.mobileFrontend ) );
