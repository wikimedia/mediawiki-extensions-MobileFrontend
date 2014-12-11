( function ( M ) {
	var
		PhotoUploaderButton = M.require( 'modules/uploads/PhotoUploaderButton' ),
		Icon = M.require( 'Icon' ),
		uploadIcon = new Icon( {
			name: 'addimage-enabled',
			additionalClassNames: 'enabled'
		} ),
		LeadPhotoUploaderButton;

	/**
	 * Component for uploading lead photo
	 * @class LeadPhotoUploaderButton
	 * @extends PhotoUploaderButton
	 */
	LeadPhotoUploaderButton = PhotoUploaderButton.extend( {
		template: mw.template.get( 'mobile.upload.ui', 'LeadButton.hogan' ),
		className: uploadIcon.getClassName(),

		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.buttonCaption Caption that is a call to action to add the
		 * first image.
		 * @cfg {Boolean} defaults.insertInPage If the image should be prepended to the wikitext
		 * of a page specified by options.pageTitle.
		 * @cfg {String} defaults.el CSS selector of the element in which the
		 * LeadPhotoUploaderButton is rendered.
		 */
		defaults: {
			buttonCaption: mw.msg( 'mobile-frontend-photo-upload' ),
			insertInPage: true,
			el: '#ca-upload'
		},

		/** @inheritdoc */
		initialize: function ( options ) {
			options.pageTitle = mw.config.get( 'wgPageName' );
			PhotoUploaderButton.prototype.initialize.apply( this, arguments );
		}
	} );

	LeadPhotoUploaderButton.isSupported = PhotoUploaderButton.isSupported;

	M.define( 'modules/uploads/LeadPhotoUploaderButton', LeadPhotoUploaderButton );

}( mw.mobileFrontend ) );
