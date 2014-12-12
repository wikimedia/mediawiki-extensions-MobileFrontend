( function ( M ) {

	var LeadPhoto,
		View = M.require( 'View' );

	/**
	 * Class for showing lead photo
	 * @class LeadPhoto
	 * @extends View
	 */
	LeadPhoto = View.extend( {
		template: mw.template.get( 'mobile.uploads', 'LeadPhoto.hogan' )
	} );

	M.define( 'modules/uploads/LeadPhoto', LeadPhoto );

}( mw.mobileFrontend ) );
