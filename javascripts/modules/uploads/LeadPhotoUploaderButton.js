( function ( M ) {
	var
		PhotoUploaderButton = M.require( 'modules/uploads/PhotoUploaderButton' ),
		Icon = M.require( 'Icon' ),
		uploadIcon = new Icon( { name: 'addimage-enabled', additionalClassNames: 'enabled' } ),
		LeadPhotoUploaderButton;

	/**
	 * Component for uploading lead photo
	 * @class LeadPhotoUploaderButton
	 * @extends PhotoUploaderButton
	 */
	LeadPhotoUploaderButton = PhotoUploaderButton.extend( {
		template: mw.template.get( 'mobile.upload.ui', 'LeadButton.hogan' ),
		className: uploadIcon.getClassName(),

		defaults: {
			buttonCaption: mw.msg( 'mobile-frontend-photo-upload' ),
			insertInPage: true,
			el: '#ca-upload'
		},

		initialize: function ( options ) {
			options.pageTitle = mw.config.get( 'wgPageName' );
			PhotoUploaderButton.prototype.initialize.apply( this, arguments );
		}
	} );

	LeadPhotoUploaderButton.isSupported = PhotoUploaderButton.isSupported;

	M.define( 'modules/uploads/LeadPhotoUploaderButton', LeadPhotoUploaderButton );

}( mw.mobileFrontend ) );
