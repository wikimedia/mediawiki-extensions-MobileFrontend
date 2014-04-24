( function( M, $ ) {

	var
		Overlay = M.require( 'OverlayNew' ),
		LeadPhotoUploaderButton = M.require( 'modules/uploads/PhotoUploaderButton' ),
		buttonMsg = mw.msg( 'mobile-frontend-first-upload-wizard-new-page-3-ok' ),
		UploadTutorial;

	UploadTutorial = Overlay.extend( {
		template: M.template.get( 'uploads/UploadTutorial' ),
		className: 'overlay carousel border-box tutorial',

		defaults: {
			pages: [
				{
					caption: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-1-header' ),
					text: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-1' )
				},
				{
					caption: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-2-header' ),
					text: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-2' )
				},
				{
					caption: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-3-header' ),
					button: buttonMsg
				}
			]
		},

		postRender: function( options ) {
			var self = this, $button = this.$( '.button' );

			if ( options.funnel ) {
				new LeadPhotoUploaderButton( {
					el: $button,
					buttonCaption: buttonMsg,
					funnel: options.funnel
				} );
				$button.on( 'click', function() {
					// need timeout for the file dialog to open
					setTimeout( $.proxy( self, 'hide' ), 0 );
					setTimeout( $.proxy( self, 'emit', 'hide' ), 0 );
				} );
			}

			this.page = 0;
			this.totalPages = options.pages.length;
			this.$( '.prev' ).on( M.tapEvent( 'click' ), $.proxy( this, 'previous' ) );
			this.$( '.next' ).on( M.tapEvent( 'click' ), $.proxy( this, 'next' ) );

			this._showCurrentPage();

			this._super( options );
		},

		_showCurrentPage: function() {
			this.$( '.slide' ).removeClass( 'active' ).eq( this.page ).addClass( 'active' );
			this.$( '.prev' ).toggle( this.page > 0 );
			this.$( '.next' ).toggle( this.page < this.totalPages - 1 );
		},

		next: function() {
			this.page += 1;
			this._showCurrentPage();
		},

		previous: function() {
			this.page -= 1;
			this._showCurrentPage();
		}
	} );

	M.define( 'modules/uploads/UploadTutorial', UploadTutorial );

}( mw.mobileFrontend, jQuery ));
