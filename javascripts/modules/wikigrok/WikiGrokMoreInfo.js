( function ( M ) {
	var Overlay = M.require( 'Overlay' ),
		WikiGrokMoreInfo;

	/**
	 * Show more info about the wikigrok
	 * @class WikiGrokMoreInfo
	 * FIXME: rename this to WikiGrokMoreInfoOverlay
	 * @extends Overlay
	 */
	WikiGrokMoreInfo = Overlay.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.heading Heading of the overlay.
		 */
		defaults: {
			heading: '<strong>About</strong>'
		},
		templatePartials: {
			content: mw.template.get( 'mobile.wikigrok.dialog', 'WikiGrokMoreInfo/content.hogan' )
		}
	} );

	M.define( 'modules/wikigrok/WikiGrokMoreInfo', WikiGrokMoreInfo );
}( mw.mobileFrontend ) );
