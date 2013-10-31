( function( M, $ ) {

	var Overlay = M.require( 'Overlay' ), UploadTutorial;

	UploadTutorial = Overlay.extend( {
		template: M.template.get( 'uploads/UploadTutorial' ),
		className: 'mw-mf-overlay carousel tutorial',

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
					button: mw.msg( 'mobile-frontend-first-upload-wizard-new-page-3-ok' )
				}
			],
			fileButton: false
		},

		postRender: function( options ) {
			var self = this, $input = this.$( 'input' );

			this.page = 0;
			this.totalPages = options.pages.length;
			this.$( '.prev' ).on( M.tapEvent( 'click' ), $.proxy( this, 'previous' ) );
			this.$( '.next' ).on( M.tapEvent( 'click' ), $.proxy( this, 'next' ) );
			$input.
				on( 'change', function() {
					self.emit( 'file', $input[0].files[0] );
				} ).
				on( 'click', function() {
					// need timeout for the file dialog to open
					setTimeout( $.proxy( self, 'hide' ), 0 );
				} );
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
