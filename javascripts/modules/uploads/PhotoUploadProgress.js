( function( M, $ ) {
	var Overlay = M.require( 'Overlay' ),
		ProgressBar = M.require( 'widgets/progress-bar' ),
		AbuseFilterPanel = M.require( 'modules/editor/AbuseFilterPanel' ),
		PhotoUploadProgress;

	PhotoUploadProgress = Overlay.extend( {
		defaults: {
			uploadingMsg: mw.msg( 'mobile-frontend-image-uploading' ),
			saveMsg: mw.msg( 'mobile-frontend-editor-save' )
		},
		template: M.template.get( 'uploads/PhotoUploadProgress' ),
		fullScreen: false,

		initialize: function( options ) {
			this._super( options );
			this.progressBar = new ProgressBar();
		},

		postRender: function() {
			this._super();
			this.$( '.submit' ).on( M.tapEvent( 'click' ), $.proxy( this, 'emit', 'submit' ) );
		},

		showAbuseFilter: function( type, message ) {
			new AbuseFilterPanel().appendTo( this.$( '.overlay-header-container' ) ).show( type, message );
			this._showHidden( '.save-header' );
		},

		hide: function( force ) {
			if ( force ) {
				return this._super();
			} else if ( window.confirm( mw.msg( 'mobile-frontend-image-cancel-confirm' ) ) ) {
				this.emit( 'cancel' );
				return this._super();
			} else {
				return false;
			}
		},

		setValue: function( value ) {
			var $uploading = this.$( '.uploading' );
			// only add progress bar if we're getting progress events
			if ( $uploading.length && $uploading.text() !== '' ) {
				$uploading.text( '' );
				this.progressBar.appendTo( $uploading );
				this.$( '.right' ).remove();
			}
			this.progressBar.setValue( value );
		}
	} );

	M.define( 'modules/uploads/PhotoUploadProgress', PhotoUploadProgress );

}( mw.mobileFrontend, jQuery ) );
