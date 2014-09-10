( function( M ) {
	var
		PhotoUploaderButton = M.require( 'modules/uploads/PhotoUploaderButton' ),
		LeadPhotoUploaderButton;

	LeadPhotoUploaderButton = PhotoUploaderButton.extend( {
		template: M.template.get( 'uploads/LeadPhotoUploaderButton.hogan' ),
		className: 'enabled',

		defaults: {
			buttonCaption: mw.msg( 'mobile-frontend-photo-upload' ),
			insertInPage: true,
			el: '#ca-upload',
		},

		initialize: function( options ) {
			options.pageTitle = mw.config.get( 'wgPageName' );
			PhotoUploaderButton.prototype.initialize.apply( this, arguments );
		}
	} );

	LeadPhotoUploaderButton.isSupported = PhotoUploaderButton.isSupported;

	M.define( 'modules/uploads/LeadPhotoUploaderButton', LeadPhotoUploaderButton );

}( mw.mobileFrontend ) );
