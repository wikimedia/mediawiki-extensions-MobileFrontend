( function( M ) {
	var
		popup = M.require( 'toast' ),
		PhotoUploaderButton = M.require( 'modules/uploads/PhotoUploaderButton' ),
		LeadPhotoUploaderButton;

	LeadPhotoUploaderButton = PhotoUploaderButton.extend( {
		template: M.template.get( 'uploads/LeadPhotoUploaderButton' ),
		className: 'enabled',

		defaults: {
			buttonCaption: mw.msg( 'mobile-frontend-photo-upload' ),
			insertInPage: true,
			el: '#ca-upload',
		},

		initialize: function( options ) {
			var self = this;

			options.pageTitle = mw.config.get( 'wgPageName' );

			this._super( options );
			// FIXME: Kill use of these events when new upload workflow goes to stable
			this.on( 'start', function() {
					self.$el.removeClass( 'enabled' );
				} ).
				on( 'success', function( data ) {
					popup.show( mw.msg( 'mobile-frontend-photo-upload-success-article' ), 'toast' );

					// just in case, LeadPhoto should be loaded by now anyway
					mw.loader.using( 'mobile.uploads.common', function() {
						var LeadPhoto = M.require( 'modules/uploads/LeadPhoto' );

						new LeadPhoto( {
							url: data.url,
							pageUrl: data.descriptionUrl,
							caption: data.description
						} ).prependTo( M.getLeadSection() );
					} );
				} ).
				on( 'error cancel', function() {
					self.$el.addClass( 'enabled' );
				} );
		}
	} );

	LeadPhotoUploaderButton.isSupported = PhotoUploaderButton.isSupported;

	M.define( 'modules/uploads/LeadPhotoUploaderButton', LeadPhotoUploaderButton );

}( mw.mobileFrontend ) );
